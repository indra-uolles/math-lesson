var task = (function () {
 
    var _solution = {
            steps: [],
            inputs: {}
        },
        _currStep = {
            number: 0,
            inputs: {}
        };

    return {
        init: function(steps, inputs) {
            _solution.steps = steps;
            _solution.inputs = inputs;
            _setInputs(inputs);
        },
        reset: function() {
            _currStep.number = 0;
            _setInputs(_solution.inputs);
        },
        next: function(inputs) {
            _currStep.number++;
            _setInputs(_solution.inputs);
        },
        getStep: function() {
            var nextStep = _renderStep(_currStep.number, _solution.steps);

            nextStep.length && _currStep.number > 0 && 
                (nextStep = _renderSign({ content : '=' }) + nextStep);

            return nextStep;
        },
        checkValue: function(value, id) {
            
            return _solution.inputs[id].value == value ? true : false;
        },
        updateProgress: function(value, id) {
            _solution.inputs[id].value == value ? 
                _currStep.inputs[id] = true  :
                _currStep.inputs[id] = false; 
        },
        getProgress: function() {
            var solved = true;
            for (var i in _currStep.inputs) { if (_currStep.inputs[i] === false) { solved = false } }; 

            return solved; 
        },
        getHint: function(id) {
            return _solution.inputs[id].hint;    
        }
    };

    function _renderStep(index, steps) {
        if (!steps || index >= steps.length) { return '' };

        return '<div class="step step_small">' +
            steps[index].reduce(function(prev, curr) { return prev += _renderFormulaUnit(curr) }, '') +
            '</div>';
    }

    function _renderFormulaUnit(unit) {
        var cases = {
                'frac': _renderFrac,
                'sign': _renderSign
            };

        return cases[unit.type](unit) || '';
    }

    function _renderFrac(frac) {
        var num = frac.content.num,
            denum = frac.content.denum,
            isPlain = !(typeof(num) === 'object' || typeof(denum) === 'object');

        return '<div class="fraction formula-unit' + (isPlain? ' plain' : '') + '">' +
                    _renderFracPart(num, 'num') + _renderFracPart(denum, 'denum') +
                '</div>';
    }

    function _renderFracPart(el, type) {  

        var result = '<div class="' + type + '">';

        typeof(el) === 'object' ?
            result += el.length ?
                el.reduce(function(prev, curr) { return prev += _renderSymbol(curr) }, '') :
                _renderSymbol(el) :
            result += el;

        return result += '</div>';
    }

    function _renderSign(unit) {
        
        return '<div class="sign formula-unit">' + unit.content + '</div>';
    }

    function _renderSymbol(symbol) {

        return (typeof(symbol) === 'object' && symbol.type == 'input') ? 
            '<input id="' + symbol.content.id + '" type="text" class="formula-input">' :
            symbol;
    }

    function _setInputs(inputs) {
        _currStep.inputs = {};
        for (var i in inputs) {
            if (inputs[i].step === _currStep.number) { _currStep.inputs[inputs[i].id] = false };
        }
    }
})();