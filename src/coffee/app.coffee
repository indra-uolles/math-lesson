$ ->
  
  steps = []
  inputs = {}
  task = new Task

  $.getJSON './json/steps.json', (data) ->
    steps = data.map (obj) -> obj.step

  $.getJSON './json/inputs.json', (data) ->
    data.map (obj) -> inputs[obj.id] = obj 
    task.init steps, inputs
    $('.steps-container').html ''
    _addStep task.getStep()

  $('.steps-container').on 'blur', '.formula-input', (e) ->
    input = $(this)
    id = $(this).attr 'id'
    val = $(this).val()
    correct = task.checkValue val, id
    
    if val isnt '' and !correct
      _addHint input
      input = $('#' + id)
      input.val val
      input.addClass 'wrong'
    
    input.prop 'disabled', true if correct 
    task.updateProgress val, id
    _afterCheck task.getProgress()

  $('.steps-container').on 'focus', '.formula-input', (e) ->
    if $(this).hasClass 'wrong'
      $(this).removeClass('wrong').val ''
    _removeHint $(this)

  _afterCheck = (progress) ->
    if progress
      task.next()

      nextStep = task.getStep()

      if not nextStep.length
        $('.steps-container').html ''
        task.reset()
        nextStep = task.getStep()
      
      _addStep nextStep   

  _addStep = (step) -> $(step).appendTo '.steps-container'

  _addHint = (input) ->
    id = input.attr 'id'
    hint = task.getHint id

    if hint
      input.closest('input').replaceWith '<div class="input-container hinted"><input id="' + id + '" type="text" class="formula-input"><div class="hint">' + hint + '</div></div>'

  _removeHint = (input) ->
    id = input.attr 'id'
    val = input.val()

    input.closest('.input-container').replaceWith "<input id=\"#{id}\" type=\"text\" class=\"formula-input\">"
    $('#' + id).val val

  return