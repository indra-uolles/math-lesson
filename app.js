var steps,
    inputs = {};

$(function() {
    $.getJSON('steps.json', function(data) {
        var rendered = '';

        for (var i in steps = data.map(function(obj) { return obj.step })) {
            rendered += renderStep(i) + (i < steps.length - 1 ? renderSign({ content : "=" }) : '');  
        }

        $(rendered).appendTo(".steps-container");
    });

    var def = $.Deferred();

    $.getJSON('inputs.json', function(data) { 
        data.map(function(obj) { inputs[obj.id] = obj });
    });

    //addHint($('#i1'));
    //addHint($('#i10'));
}); 

function addHint(input) {
    var old = input.closest('input'),
        hint = getHint(input);

    hint && old.replaceWith(
        '<div class="input-container hinted">' + 
        renderSymbol({ "type": "input", "content": { "id": input.attr('id') } }) + 
        '<div class="hint">' + getHint(input) +
        '</div>' + '</div>');
}

function getHint(input) {
    return inputs[input.attr("id")].hint;
}

function renderStep(j){

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