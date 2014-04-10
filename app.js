var steps,
    inputs = {},
    currStep = 0,
    currInputs;

$(function() {
    $.getJSON('steps.json', function(data) {
        var rendered = '',
            currToSolve = {};

        steps = data.map(function(obj) { return obj.step })

        $(renderStep(0)).appendTo(".steps-container");
        currStep++;
    });

    $.getJSON('inputs.json', function(data) { 
        data.map(function(obj) { inputs[obj.id] = obj });
        currInputs = getCurrentInputs(0);
    });   

    $(".steps-container").on( "blur", ".formula-input", function(e) {
        var id = $(this).attr("id"),
            val = $(this).val(),
            wrong = (inputs[id].value != val);
        
        if (val != '' && wrong) {
            addHint($(this));

            var input = $('#' + id);

            input.val(val);
            input.addClass("wrong");
        }

        id in currInputs && (currInputs[id] = wrong ? false : true);
        checkStep();
    });

    $(".steps-container").on( "focus", ".formula-input", function(e) {
        $(this)
            .hasClass('wrong') && $(this).removeClass('wrong')
            .val('');

        removeHint($(this));
    });
});

function checkStep() {
    var solved = true;
    for (i in currInputs) { if (currInputs[i] === false) { solved = false } };
    if (solved) {
        var nextStep = renderStep(currStep);

        if (nextStep.length) { 
            nextStep = renderSign({ content : "=" }) + nextStep;
            $(nextStep).appendTo(".steps-container"); 
            currInputs = getCurrentInputs(currStep);   
            currStep++;
        } else {
            $(".steps-container").html('');
            $(renderStep(0)).appendTo(".steps-container");
            currStep = 0;
            currInputs = getCurrentInputs(0);    
        }
    }
}

function getCurrentInputs(k) {
    var result = {};

    for (i in inputs) {
        if (inputs[i].step === k) { result[inputs[i].id] = false };
    }

    return result;
}

function addHint(input) {
    var old = input.closest('input'),
        hint = getHint(input);

    hint && old.replaceWith(
        '<div class="input-container hinted">' + 
        renderSymbol({ "type": "input", "content": { "id": input.attr('id') } }) + 
        '<div class="hint">' + getHint(input) +
        '</div>' + '</div>');
}

function removeHint(input) {
    var old = input.closest('.input-container'),
        id = input.attr("id"),
        val = input.val();

    old.replaceWith(renderSymbol({ "type": "input", "content": { "id": id } })); 
    $('#' + id).val(val);
}

function getHint(input) {
    return inputs[input.attr("id")].hint;
}

function renderStep(j) {

    if (j >= steps.length) { return '' };

    return '<div class="step step_small">' +
        steps[j].reduce(function(prev, curr) { return prev += renderFormulaUnit(curr) }, '') +
        '</div>';
}

function renderFormulaUnit(unit) {
    var type = unit.type,
        cases = {
            "frac": renderFrac,
            "sign": renderSign
        };

    return cases[type](unit) || '';
}

function renderFrac(frac) {
    var num = frac.content.num,
        denum = frac.content.denum,
        isPlain = !(typeof(num) === "object" || typeof(denum) === "object");

    return '<div class="fraction formula-unit' + (isPlain? ' plain' : '') + '">' +
                renderFracPart(num, "num") + renderFracPart(denum, "denum") +
            '</div>';
}

function renderFracPart(el, type) {   

    var result = '<div class="' + type + '">';

    typeof(el) === "object" ?
        result += el.length ? 
            el.reduce(function(prev, curr) { return prev += renderSymbol(curr) }, '') :
            renderSymbol(el) :
        result += el;

    return result += '</div>';
}

function renderSymbol(symbol) {

    return (typeof(symbol) === "object" && symbol.type == "input") ? 
        '<input id="' + symbol.content.id + '" type="text" class="formula-input">' :
        symbol;
}

function renderSign(unit) {
    return '<div class="sign formula-unit">' + unit.content + '</div>';
}