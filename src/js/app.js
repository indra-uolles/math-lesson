$(function() {
    var steps,
        inputs = {};

    $.getJSON('./json/steps.json', function(data) {
        steps = data.map(function(obj) { return obj.step });
    });

    $.getJSON('./json/inputs.json', function(data) {
        data.map(function(obj) { inputs[obj.id] = obj });
        task.init(steps, inputs);
        $('.steps-container').html('');
        _addStep(task.getStep());
    });

    $('.steps-container').on('blur', '.formula-input', function(e) {
        var input = $(this),
            id = $(this).attr('id'),
            val = $(this).val(),
            correct = task.checkValue(val, id);
        
        if (val !== '' && !correct) {
            _addHint(input);

            input = $('#' + id);
            input.val(val);
            input.addClass('wrong');
        }

        correct && (input.prop('disabled', true));
        task.updateProgress(val, id);
        _afterCheck(task.getProgress());
    });

    $('.steps-container').on('focus', '.formula-input', function(e) {
        $(this).hasClass('wrong') && $(this).removeClass('wrong').val('');
        _removeHint($(this));
    });
});

/**
 * @private
 * Если шаг выполнен правильно, то добавляет в поле решения следующий шаблон ввода шага
 * решения, а также обновляет структуру данных для учета прогресса по шагу
 * @param  {Boolean} progress правильность шага
 */
function _afterCheck(progress) {
    if (progress) {
        task.next();

        var nextStep = task.getStep();

        if (!nextStep.length) {
            $('.steps-container').html('');
            task.reset();
            nextStep = task.getStep(); 
        }

        _addStep(nextStep);   
    }
}

/**
 * Добавляет шаблон шага решения в поле решения
 * @param {String} step html-представление шаблона шага
 */
function _addStep(step) { $(step).appendTo('.steps-container') }

/**
 * Добавляет подсказку к полю ввода
 * @param {jQuery} input поле ввода
 */
function _addHint(input) {
    var id = input.attr('id'),
        hint = task.getHint(id);

    hint && input.closest('input').replaceWith(
        '<div class="input-container hinted">' + 
        '<input id="' + id + '" type="text" class="formula-input">' +
        '<div class="hint">' + hint + '</div></div>');
}

/**
 * Удаляет подсказку, всплывшую над некоторым полем ввода
 * @param  {jQuery} input поле ввода
 */
function _removeHint(input) {
    var id = input.attr('id'),
        val = input.val();

    input.closest('.input-container').replaceWith(
        '<input id="' + id + '" type="text" class="formula-input">');
    $('#' + id).val(val);
}