var steps,
    inputs = {},
    currStep = 0,
    currInputs;

$(function() {

    $.getJSON('steps.json', function(data) {
        steps = data.map(function(obj) { return obj.step });
    });

    $.getJSON('inputs.json', function(data) {
        data.map(function(obj) { inputs[obj.id] = obj });
        init();
        addStep(getStep(0));
    });

    $('.steps-container').on('blur', '.formula-input', function(e) {
        var input = $(this),
            id = $(this).attr('id'),
            val = $(this).val(),
            wrong = (inputs[id].value != val);
        
        if (val !== '' && wrong) {
            addHint(input);

            input = $('#' + id);

            input.val(val);
            input.addClass('wrong');
        }

        !wrong && (input.prop('disabled', true));
        currInputs[id] = wrong ? false : true;

        checkStep();
    });

    $('.steps-container').on('focus', '.formula-input', function(e) {
        $(this).hasClass('wrong') && $(this).removeClass('wrong').val('');

        removeHint($(this));
    });
});

function init() {
    $('.steps-container').html('');
    currStep = 0;   
}

function checkStep() {
    var solved = true;
    for (var i in currInputs) { if (currInputs[i] === false) { solved = false } };

    if (solved) {
        var nextStep = getStep(currStep);

        if (nextStep.length) { 
            addStep(nextStep);
        } else {
            init(); 
            addStep(getStep(0));   
        }
    }
}

function addStep(step) {
    $(step).appendTo('.steps-container'); 
    currInputs = getCurrentInputs(currStep);   
    currStep++;    
}

function getStep(j) {
    var nextStep = renderStep(j);

    return nextStep.length ? (j > 0 ? renderSign({ content : '=' }) : '') + nextStep : '';
}

function getCurrentInputs(k) {
    var result = {};

    for (i in inputs) {
        if (inputs[i].step === k) { result[inputs[i].id] = false };
    }

    return result;
}

function addHint(input) {
    var hint = getHint(input);

    hint && input.closest('input').replaceWith(
        '<div class="input-container hinted">' + 
        renderSymbol({ type: 'input', content: { 'id': input.attr('id') } }) + 
        '<div class="hint">' + hint + '</div></div>');
}

function removeHint(input) {
    var id = input.attr('id'),
        val = input.val();

    input.closest('.input-container').replaceWith(
        renderSymbol({ type: 'input', content: { 'id': id } })); 
    $('#' + id).val(val);
}

function getHint(input) {
    return inputs[input.attr('id')].hint;
}

function renderStep(j) {
    if (!steps || j >= steps.length) { return '' };

    return '<div class="step step_small">' +
        steps[j].reduce(function(prev, curr) { return prev += renderFormulaUnit(curr) }, '') +
        '</div>';
}

function renderFormulaUnit(unit) {
    var cases = {
            'frac': renderFrac,
            'sign': renderSign
        };

    return cases[unit.type](unit) || '';
}

function renderFrac(frac) {
    var num = frac.content.num,
        denum = frac.content.denum,
        isPlain = !(typeof(num) === 'object' || typeof(denum) === 'object');

    return '<div class="fraction formula-unit' + (isPlain? ' plain' : '') + '">' +
                renderFracPart(num, 'num') + renderFracPart(denum, 'denum') +
            '</div>';
}

function renderFracPart(el, type) {  

    var result = '<div class="' + type + '">';

    typeof(el) === 'object' ?
        result += el.length ?
            el.reduce(function(prev, curr) { return prev += renderSymbol(curr) }, '') :
            renderSymbol(el) :
        result += el;

    return result += '</div>';
}

function renderSymbol(symbol) {

    return (typeof(symbol) === 'object' && symbol.type == 'input') ? 
        '<input id="' + symbol.content.id + '" type="text" class="formula-input">' :
        symbol;
}

function renderSign(unit) {
    return '<div class="sign formula-unit">' + unit.content + '</div>';
}