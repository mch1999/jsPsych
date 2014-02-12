/**
 * jsPsych plugin for showing animations that mimic the experiment described in
 * 
 * Fiser, J., & Aslin, R. N. (2002). Statistical learning of higher-order 
 * temporal structure from visual shape sequences. Journal of Experimental 
 * Psychology: Learning, Memory, and Cognition, 28(3), 458.
 * 
 * Josh de Leeuw
 * February 2014
 * 
 * REQUIRES rapaheljs (www.raphaeljs.com)
 * 
 * parameters:
 *      stimuli: array of paths to images. will be shown in the order declared in array
 *      timing_cycle: how long for an image to complete an animation cycle
 *      canvas_size: array [width, height] - how big to draw the area
 *      image_size: array [width, height] - how big to draw the stimuli
 *      initial_direction: "left" or "right" - which way to move the first image
 *      occlude_center: if true, draw a rectangle in the center to occlude the swaps between images
 *      timing_pre_movement: how long to wait before the first image starts moving
 *      timing_post_trial: how long to show blank screen after trial
 *      data: the optional data object
 * 
 */

(function($) {
    jsPsych['vsl-animate-occlusion'] = (function() {

        var plugin = {};

        plugin.create = function(params) {
            var trials = new Array(1);

            trials[0] = {};
            trials[0].type = "vsl-animate-occlusion";
            trials[0].stims = params.stimuli;
            trials[0].timing_cycle = params.timing_cycle || 1000;
            trials[0].canvas_size = params.canvas_size || [400, 400];
            trials[0].image_size = params.image_size || [100, 100];
            trials[0].initial_direction = params.initial_direction || "left";
            trials[0].occlude_center = (typeof params.occlude_center === 'undefined') ? true : params.occlude_center;
            trials[0].timing_post_trial = (typeof params.timing_post_trial === 'undefined') ? 1000 : params.timing_post_trial;
            trials[0].timing_pre_movement = (typeof params.timing_pre_movement === 'undefined') ? 500 : params.timing_pre_movement;
            //trials[0].prompt = (typeof params.prompt === 'undefined') ? "" : params.prompt;
            trials[0].data = (typeof params.data === 'undefined') ? {} : params.data;

            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {

            var directions = [
                [{
                    params: {
                        x: trial.canvas_size[0] - trial.image_size[0]
                    },
                    ms: trial.timing_cycle / 2
                }, {
                    params: {
                        x: trial.canvas_size[0] / 2 - trial.image_size[0] / 2
                    },
                    ms: trial.timing_cycle / 2
                }],
                [{
                    params: {
                        x: 0
                    },
                    ms: trial.timing_cycle / 2
                }, {
                    params: {
                        x: trial.canvas_size[0] / 2 - trial.image_size[0] / 2
                    },
                    ms: trial.timing_cycle / 2
                }]
            ];

            var which_image = 0;
            var next_direction = (trial.initial_direction == "right") ? 0 : 1;

            function next_step() {
                if (trial.stims.length == which_image) {
                    endTrial();
                }
                else {

                    var d = directions[next_direction];
                    next_direction === 0 ? next_direction = 1 : next_direction = 0;
                    var i = trial.stims[which_image];
                    which_image++;

                    c.attr({
                        src: i
                    });
                    c.animate(d[0].params, d[0].ms, function() {
                        c.animate(d[1].params, d[1].ms, function() {
                            next_step();
                        });
                    });
                }
            }
            
            display_element.append($("<div id='jspsych-vsl-animate-occlusion-raphaelCanvas'>", {
                css: {
                    width: trial.canvas_size[0] + "px",
                    height: trial.canvas_size[1] + "px"
                }
            }));

            var paper = Raphael("jspsych-vsl-animate-occlusion-raphaelCanvas", trial.canvas_size[0], trial.canvas_size[1]);

            var c = paper.image(trial.stims[which_image], trial.canvas_size[0] / 2 - trial.image_size[0] / 2, trial.canvas_size[1] / 2 - trial.image_size[1] / 2, trial.image_size[0], trial.image_size[1]);

            if (trial.occlude_center) {
                paper.rect((trial.canvas_size[0] / 2) - (trial.image_size[0] / 2), 0, trial.image_size[0], trial.canvas_size[1]).attr({
                    fill: "#000"
                });
            }

            if (trial.timing_pre_movement > 0) {
                setTimeout(function() {
                    next_step();
                }, trial.timing_pre_movement);
            }
            else {
                next_step();
            }

            function endTrial() {
                
                display_element.html('');
                
                block.writeData($.extend({}, {
                    "trial_type": "vsl-animate-occlusion",
                    "trial_index": block.trial_idx,
                    "stimuli": JSON.stringify(trial.stims)
                }, trial.data));

                if (trial.timing_post_trial > 0) {
                    setTimeout(function() {
                        block.next();
                    }, trial.timing_post_trial);
                }
                else {
                    block.next();
                }
            }
        };

        return plugin;
    })();
})(jQuery);