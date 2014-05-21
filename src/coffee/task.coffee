class this.Task  

  _solution = 
    steps: []
    inputs: {}

  _currStep = 
    number: 0
    inputs: {}

  ###*
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
  ###
  init: (steps, inputs) ->
    _solution.steps = steps
    _solution.inputs = inputs
    _setInputs inputs
    return

  ###*
   * @public
   * Подготавливает данные для решения "заново": изменяет номер текущего
   * шага, а также структуру данных для учета прогресса по шагу
  ###
  reset: ->
    _currStep.number = 0
    _setInputs _solution.inputs
    return

  ###*
   * @public
   * Подготавливает данные для проверки следующего шага решения:
   * обновляет номер текущего шага, а также структуру данных
   * для учета прогресса по шагу
   * @param  {Object[Object]} inputs
  ###
  next: (inputs) ->
    _currStep.number++
    _setInputs _solution.inputs
    return

  ###*
   * @public
   * формирует конечное html-представление шаблона следующего шага решения,
   * при необходимости предваряя его знаком '='
   * @return {String} html-представление шаблона
  ###
  getStep: ->
    nextStep = _renderStep _currStep.number, _solution.steps

    if nextStep.length and _currStep.number > 0 
      nextStep = _renderSign({ content : '=' }) + nextStep

    nextStep

  ###*
   * @public
   * сверяет введенное пользователем в поле ввода значение с тем значением, 
   * которое должно быть
   * @param  {String} value значение поля ввода
   * @param  {String} id идентификатор поля ввода
   * @return {Boolean} результат проверки
  ###
  checkValue: (value, id) ->
    if _solution.inputs[id].value == Number(value) then true else false

  ###*
   * @public
   * Обновляет сведения о прогрессе в выполнении текущего шага решения
   * @param  {String} value значение, введенное в поле ввода
   * @param  {String} id идентификатор поля ввода
  ###
  updateProgress: (value, id) ->
    if _solution.inputs[id].value == Number(value)
      _currStep.inputs[id] = true
      return 
    else 
      _currStep.inputs[id] = false 
      return

  ###*
   * @public
   * Проверяет, ввел ли пользователь правильно шаг решения (для этого должны быть
   * правильно заполнены все соответствующие поля ввода)
   * @return {Boolean} результат проверки
  ###
  getProgress: ->
    solved = true
    for own key of _currStep.inputs
      if _currStep.inputs[key] == false then solved = false

    solved

  ###*
   * @public
   * Возвращает подсказку для поля ввода 
   * @param  {String} id идентификатор поля ввода
   * @return {String} подсказка
  ###
  getHint: (id) -> _solution.inputs[id].hint    

  ###*
   * @private
   * Формирует html-представление шаблона шага решения по его номеру
   * @param  {Number} index номер шага
   * @param  {Array[Array[Object]]} steps информация для рендеринга шаблонов шагов решения
   * @return {String} html-представление шаблона шага решения
  ###
  _renderStep = (index, steps) ->
    if not steps or index >= steps.length then return ''

    output = '<div class="step step_small">'
    output += steps[index].reduce (prev, curr) -> 
        prev += _renderFormulaUnit(curr)
      , ''
    output += '</div>'

  ###*
   * @private
   * Формирует html-представление части шаблона шага решения
   * @param {Object} unit внутреннее представление части шаблона шага решения
   *
   * @example 
   * _renderFormulaUnit({ content: { num: 1, denum: 3}, type: 'frac'}) вернет
   * '<div class="fraction formula-unit plain"><div class="num">1</div><div class="denum">3</div></div>'
   *
   * @return {String} html-представление 
  ###
  _renderFormulaUnit = (unit) ->
    cases = 
      'frac': _renderFrac
      'sign': _renderSign

    cases[unit.type](unit) or ''

  ###*
   * @private
   * Формирует html-представление части шаблона шага решения, соответствующей дроби
   *
   * isPlain = true, если числитель и/или знаменатель дроби не являются массивами,
   * включающими в себя поля ввода (это нужно для стилизации отступов)
   *
   * @param  {Object} frac внутреннее представление дроби
   * @return {String} html-представление
  ###
  _renderFrac = (frac) ->
    num = frac.content.num
    denum = frac.content.denum
    isPlain = not(typeof num == 'object' or typeof denum == 'object')

    '<div class="fraction formula-unit' + 
      (if isPlain then ' plain' else '') + '">' + 
      _renderFracPart(num, 'num') + _renderFracPart(denum, 'denum') + '</div>'

  ###*
   * Формирует html-представление части шаблона шага решения, соответствующей 
   * числителю или знаменателю дроби
   * @param  {Object} el внутреннее представление числителя или знаменателя
   * @param  {String} ['num' | 'denum'] type 
   * @return {String} html-представление
  ###
  _renderFracPart = (el, type) ->
    result = "<div class=\"#{type}\">"

    if typeof(el) == 'object'
      if el.length
        result +=
          el.reduce (prev, curr) -> 
              prev += _renderSymbol(curr)
            , ''
      else result += _renderSymbol el
    else result += el

    result += '</div>'

  ###*
   * @private
   * Формирует html-представление части шаблона шага решения, соответствующей
   * арифметическому знаку
   * @param  {Object} unit внутреннее представление знака
   * @return {String} html-представление
  ###
  _renderSign = (unit) ->  
    '<div class="sign formula-unit">' + unit.content + '</div>'

  ###*
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
  ###
  _renderSymbol = (symbol) ->
    if (typeof symbol == 'object' and symbol.type == 'input') 
      '<input id="' + symbol.content.id + '" type="text" class="formula-input">' 
    else symbol

  ###*
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
  ###
  _setInputs = (inputs) ->
    _currStep.inputs = {}
    for own key of inputs
      if inputs[key].step == _currStep.number
        _currStep.inputs[inputs[key].id] = false
    return