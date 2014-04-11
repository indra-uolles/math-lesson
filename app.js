$(function() {
    var steps,
        inputs = {};

    $.getJSON('steps.json', function(data) {
        steps = data.map(function(obj) { return obj.step });
    });

    $.getJSON('inputs.json', function(data) {
        data.map(function(obj) { inputs[obj.id] = obj });
        task.init(steps, inputs);
        $('.steps-container').html('');
        addStep(task.getStep());
    });

    $('.steps-container').on('blur', '.formula-input', function(e) {
        var input = $(this),
            id = $(this).attr('id'),
            val = $(this).val(),
            correct = task.checkValue(val, id);
        
        if (val !== '' && !correct) {
            addHint(input);

            input = $('#' + id);
            input.val(val);
            input.addClass('wrong');
        }

        correct && (input.prop('disabled', true));
        task.updateProgress(val, id);
        afterCheck(task.getProgress());
    });

    $('.steps-container').on('focus', '.formula-input', function(e) {
        $(this).hasClass('wrong') && $(this).removeClass('wrong').val('');
        removeHint($(this));
    });
});

function afterCheck(progress) {
    if (progress) {
        task.next();

        var nextStep = task.getStep();

        if (!nextStep.length) {
            $('.steps-container').html('');
            task.reset();
            nextStep = task.getStep(); 
        }

        addStep(nextStep);   
    }
}

function addStep(step) { $(step).appendTo('.steps-container') }

function addHint(input) {
    var id = input.attr('id'),
        hint = task.getHint(id);

    hint && input.closest('input').replaceWith(
        '<div class="input-container hinted">' + 
        '<input id="' + id + '" type="text" class="formula-input">' +
        '<div class="hint">' + hint + '</div></div>');
}

function removeHint(input) {
    var id = input.attr('id'),
        val = input.val();

    input.closest('.input-container').replaceWith(
        '<input id="' + id + '" type="text" class="formula-input">');
    $('#' + id).val(val);
}