var __hasProp = {}.hasOwnProperty;

$(function() {
  var inputs, steps, task, _addHint, _addStep, _afterCheck, _removeHint;
  steps = [];
  inputs = {};
  task = new Task;
  $.getJSON('./json/steps.json', function(data) {
    return steps = data.map(function(obj) {
      return obj.step;
    });
  });
  $.getJSON('./json/inputs.json', function(data) {
    data.map(function(obj) {
      return inputs[obj.id] = obj;
    });
    task.init(steps, inputs);
    $('.steps-container').html('');
    return _addStep(task.getStep());
  });
  $('.steps-container').on('blur', '.formula-input', function(e) {
    var correct, id, input, val;
    input = $(this);
    id = $(this).attr('id');
    val = $(this).val();
    correct = task.checkValue(val, id);
    if (val !== '' && !correct) {
      _addHint(input);
      input = $('#' + id);
      input.val(val);
      input.addClass('wrong');
    }
    if (correct) {
      input.prop('disabled', true);
    }
    task.updateProgress(val, id);
    return _afterCheck(task.getProgress());
  });
  $('.steps-container').on('focus', '.formula-input', function(e) {
    if ($(this).hasClass('wrong')) {
      $(this).removeClass('wrong').val('');
    }
    return _removeHint($(this));
  });
  _afterCheck = function(progress) {
    var nextStep;
    if (progress) {
      task.next();
      nextStep = task.getStep();
      if (!nextStep.length) {
        $('.steps-container').html('');
        task.reset();
        nextStep = task.getStep();
      }
      return _addStep(nextStep);
    }
  };
  _addStep = function(step) {
    return $(step).appendTo('.steps-container');
  };
  _addHint = function(input) {
    var hint, id;
    id = input.attr('id');
    hint = task.getHint(id);
    if (hint) {
      return input.closest('input').replaceWith('<div class="input-container hinted"><input id="' + id + '" type="text" class="formula-input"><div class="hint">' + hint + '</div></div>');
    }
  };
  _removeHint = function(input) {
    var id, val;
    id = input.attr('id');
    val = input.val();
    input.closest('.input-container').replaceWith("<input id=\"" + id + "\" type=\"text\" class=\"formula-input\">");
    return $('#' + id).val(val);
  };
});

this.Task = (function() {
  var _currStep, _renderFormulaUnit, _renderFrac, _renderFracPart, _renderSign, _renderStep, _renderSymbol, _setInputs, _solution;

  function Task() {}

  _solution = {
    steps: [],
    inputs: {}
  };

  _currStep = {
    number: 0,
    inputs: {}
  };


  /**
   * @public
   * Инициализирует данные, необходимые для контроля за ходом решения задачи,
   * загружает сведения для формирования html-представления шаблонов шагов
   * решения (steps), а также сведения о соответствующих полям ввода
   * правильных значениях и подсказках (inputs),
   * также формирует данные для учета прогресса по первому шагу
   *
   * @example
   * элемент steps может выглядеть так: { content: { num: 1, denum: 3}, type: 'frac' }  
   * элемент inputs - так: i1: { hint: "введи знаменатель второй дроби", id: "i1", step: 0, value: 7 }
   *
   * @param  {Array[Object]} steps
   * @param  {Object} inputs
   */

  Task.prototype.init = function(steps, inputs) {
    _solution.steps = steps;
    _solution.inputs = inputs;
    _setInputs(inputs);
  };


  /**
   * @public
   * Подготавливает данные для решения "заново": изменяет номер текущего
   * шага, а также структуру данных для учета прогресса по шагу
   */

  Task.prototype.reset = function() {
    _currStep.number = 0;
    _setInputs(_solution.inputs);
  };


  /**
   * @public
   * Подготавливает данные для проверки следующего шага решения:
   * обновляет номер текущего шага, а также структуру данных
   * для учета прогресса по шагу
   * @param  {Object[Object]} inputs
   */

  Task.prototype.next = function(inputs) {
    _currStep.number++;
    _setInputs(_solution.inputs);
  };


  /**
   * @public
   * формирует конечное html-представление шаблона следующего шага решения,
   * при необходимости предваряя его знаком '='
   * @return {String} html-представление шаблона
   */

  Task.prototype.getStep = function() {
    var nextStep;
    nextStep = _renderStep(_currStep.number, _solution.steps);
    if (nextStep.length && _currStep.number > 0) {
      nextStep = _renderSign({
        content: '='
      }) + nextStep;
    }
    return nextStep;
  };


  /**
   * @public
   * сверяет введенное пользователем в поле ввода значение с тем значением, 
   * которое должно быть
   * @param  {String} value значение поля ввода
   * @param  {String} id идентификатор поля ввода
   * @return {Boolean} результат проверки
   */

  Task.prototype.checkValue = function(value, id) {
    if (_solution.inputs[id].value === Number(value)) {
      return true;
    } else {
      return false;
    }
  };


  /**
   * @public
   * Обновляет сведения о прогрессе в выполнении текущего шага решения
   * @param  {String} value значение, введенное в поле ввода
   * @param  {String} id идентификатор поля ввода
   */

  Task.prototype.updateProgress = function(value, id) {
    if (_solution.inputs[id].value === Number(value)) {
      _currStep.inputs[id] = true;
    } else {
      _currStep.inputs[id] = false;
    }
  };


  /**
   * @public
   * Проверяет, ввел ли пользователь правильно шаг решения (для этого должны быть
   * правильно заполнены все соответствующие поля ввода)
   * @return {Boolean} результат проверки
   */

  Task.prototype.getProgress = function() {
    var key, solved, _ref;
    solved = true;
    _ref = _currStep.inputs;
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      if (_currStep.inputs[key] === false) {
        solved = false;
      }
    }
    return solved;
  };


  /**
   * @public
   * Возвращает подсказку для поля ввода 
   * @param  {String} id идентификатор поля ввода
   * @return {String} подсказка
   */

  Task.prototype.getHint = function(id) {
    return _solution.inputs[id].hint;
  };


  /**
   * @private
   * Формирует html-представление шаблона шага решения по его номеру
   * @param  {Number} index номер шага
   * @param  {Array[Array[Object]]} steps информация для рендеринга шаблонов шагов решения
   * @return {String} html-представление шаблона шага решения
   */

  _renderStep = function(index, steps) {
    var output;
    if (!steps || index >= steps.length) {
      return '';
    }
    output = '<div class="step step_small">';
    output += steps[index].reduce(function(prev, curr) {
      return prev += _renderFormulaUnit(curr);
    }, '');
    return output += '</div>';
  };


  /**
   * @private
   * Формирует html-представление части шаблона шага решения
   * @param {Object} unit внутреннее представление части шаблона шага решения
   *
   * @example 
   * _renderFormulaUnit({ content: { num: 1, denum: 3}, type: 'frac'}) вернет
   * '<div class="fraction formula-unit plain"><div class="num">1</div><div class="denum">3</div></div>'
   *
   * @return {String} html-представление
   */

  _renderFormulaUnit = function(unit) {
    var cases;
    cases = {
      'frac': _renderFrac,
      'sign': _renderSign
    };
    return cases[unit.type](unit) || '';
  };


  /**
   * @private
   * Формирует html-представление части шаблона шага решения, соответствующей дроби
   *
   * isPlain = true, если числитель и/или знаменатель дроби не являются массивами,
   * включающими в себя поля ввода (это нужно для стилизации отступов)
   *
   * @param  {Object} frac внутреннее представление дроби
   * @return {String} html-представление
   */

  _renderFrac = function(frac) {
    var denum, isPlain, num;
    num = frac.content.num;
    denum = frac.content.denum;
    isPlain = !(typeof num === 'object' || typeof denum === 'object');
    return '<div class="fraction formula-unit' + (isPlain ? ' plain' : '') + '">' + _renderFracPart(num, 'num') + _renderFracPart(denum, 'denum') + '</div>';
  };


  /**
   * Формирует html-представление части шаблона шага решения, соответствующей 
   * числителю или знаменателю дроби
   * @param  {Object} el внутреннее представление числителя или знаменателя
   * @param  {String} ['num' | 'denum'] type 
   * @return {String} html-представление
   */

  _renderFracPart = function(el, type) {
    var result;
    result = "<div class=\"" + type + "\">";
    if (typeof el === 'object') {
      if (el.length) {
        result += el.reduce(function(prev, curr) {
          return prev += _renderSymbol(curr);
        }, '');
      } else {
        result += _renderSymbol(el);
      }
    } else {
      result += el;
    }
    return result += '</div>';
  };


  /**
   * @private
   * Формирует html-представление части шаблона шага решения, соответствующей
   * арифметическому знаку
   * @param  {Object} unit внутреннее представление знака
   * @return {String} html-представление
   */

  _renderSign = function(unit) {
    return '<div class="sign formula-unit">' + unit.content + '</div>';
  };


  /**
   * @private
   * Формирует html-представление части шаблона шага решения, соответствующей
   * полю ввода или последовательности символов
   * 
   * @example
   * _renderSymbol("1") вернет '1'
   * _renderSymbol({ content: { id: 'i2' }, type: 'input' }) вернет
   * '<input id="i2" type="text" class="formula-input">'
   * 
   * @param  {Object|String} symbol
   * @return {String} html-представление
   */

  _renderSymbol = function(symbol) {
    if (typeof symbol === 'object' && symbol.type === 'input') {
      return '<input id="' + symbol.content.id + '" type="text" class="formula-input">';
    } else {
      return symbol;
    }
  };


  /**
   * @private
   * Формирует сведения о полях ввода, которые нужно правильно заполнить на
   * текущем шаге решения
   * @param {Object} inputs
   *
   * @example
   * inputs = {i1: Object, i2: Object, ...}
   * i1 = { hint: "введи знаменатель второй дроби", id: "i1", step: 0, value: 7 },
   * ...
   * i5 = { hint: "", id: "i5", step: 1, value: 7 },
   * ...
   * _currStep.inputs в результате будет выглядеть так:
   * {i1: false, i2: false, i3: false, i4: false}
   */

  _setInputs = function(inputs) {
    var key;
    _currStep.inputs = {};
    for (key in inputs) {
      if (!__hasProp.call(inputs, key)) continue;
      if (inputs[key].step === _currStep.number) {
        _currStep.inputs[inputs[key].id] = false;
      }
    }
  };

  return Task;

})();

/*
//# sourceMappingURL=main.js.map
*/
