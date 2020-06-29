
let Params = {};
let classes = [];
let Layers = [];

$('body').on('click', 'label', function() {
  $(this).prev('input').focus();
});


$(document).ready(function() {
  $('#headContent').show(400);
  $('#headbar').animate({height: 95}, 500, function() {
    $('#headbar').css('height', '100%');
    getZipFile();
  });
});


$('#goBack').click(function() {
  // window.open('../table.html', '_self');
  window.history.back();
});


function getZipFile() {
  localforage.getItem('zipFile').then(function(zip) {
    // let blob = base64toBlob(zip, 'application/zip');
    JSZip.loadAsync(zip).then(function(zip) {
      zip.forEach(function(relativePath, zipEntry) {
        // console.log(zipEntry.name);
      });
      zip.file('data.jpg').async('blob').then(
          function success(content) {
            let img = new Image();
            img.onload = function() {
              // alert(this.width + 'x' + this.height);
              // console.log('Num_data: ' + this.height);
              $('#numImages').text(this.height);
              let trainDataSize = Math.floor(
                  this.height * $('#testTrainRatio').val(),
              );
              $('#trainDataSize').val(trainDataSize);
              $('#testDataSize').val(this.height - trainDataSize);
              $('#loading').hide();
              $('#initialSettings').show(300);
              $('#initialSettings').css('display', 'flex');
            };
            let urlCreator = window.URL || window.webkitURL;
            let imageUrl = urlCreator.createObjectURL(content);
            img.src = imageUrl;
            // spriteImageURL = imageUrl;
            localforage.setItem('sprite', content);
          },
          function error(e) {
            console.log(e);
          },
      );
      zip.file('labels.bin').async('blob').then(
          function success(content) {
            localforage.setItem('labels', content);
          },
          function error(e) {
            console.log(e);
          },
      );
      zip.file('labelnames.csv').async('string').then(
          function success(content) {
            $('#classNames').val(content.trim());
          },
          function error(e) {
            console.log(e);
          },
      );
    });
  });
}


$('#testTrainRatio').on('input', function() {
  let trainDataSize = Math.floor(
      Number($('#numImages').text()) * $('#testTrainRatio').val(),
  );
  $('#trainDataSize').val(trainDataSize);
  $('#testDataSize').val(Number($('#numImages').text()) - trainDataSize);
});


$('#initSettingsSubmit').submit(function() {
  classes = $('#classNames').val().trim().split(',');
  console.log(classes);
  TRAIN_TEST_RATIO = $('#testTrainRatio').val();
  NUM_DATASET_ELEMENTS = Number($('#numImages').text());
  NUM_CLASSES = classes.length;
  IMAGE_SIZE = $('#datasetNormalWidth').val() * $('#datasetNormalHeight').val();
  NUM_TRAIN_ELEMENTS = Math.floor(TRAIN_TEST_RATIO * NUM_DATASET_ELEMENTS);
  NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS;
  Params.trainDataSize = Number($('#trainDataSize').val());
  Params.testDataSize = Number($('#testDataSize').val());
  Params.height = Number($('#datasetNormalHeight').val());
  Params.width = Number($('#datasetNormalWidth').val());
  console.log(Params);
  if ($('#RGBorGrayscale').prop('checked')) {
    NUM_CHANNELS = 4;
  } else {
    NUM_CHANNELS = 1;
  }
  $('#inputShape').val('['+$('#datasetNormalWidth').val()+','+$('#datasetNormalHeight').val()+','+NUM_CHANNELS+']');
  $('#kernelSize1').val($('#kernelSize').val());
  $('#filters1').val($('#filters').val());
  $('#outputLayer').find('#units').first().val(classes.length);
  // $('#units').val(classes.length);
  $('#initialSettings').hide(300);
  $('#layersEditor').show(300);
  $('#layersEditor').css('display', 'flex');
  $('#userTrain').show(200);
  $('#headContent').hide('200');
  $('#headContent').text('Customize the model layers');
  $('#headContent').show('300');
  $('#goBack').unbind('click');
  $('#goBack').click(function() {
    location.reload();
  });
});

let layerNumber = 1;
$('body').on('click', '#add' + 1, function() {
  // $("#add" + 1).click(function() {
  let newLayerCard = ` <div class='card LayerCard' id='Layer${layerNumber}'><!-- Card header --><div class='card-header' role='tab' id='headingOne${
    layerNumber + 1
  }'><a  class='collapsed'  data-toggle='collapse'    data-parent='#accordionEx'    href='#collapseOne${
    layerNumber + 1
  }'    aria-expanded='false'    aria-controls='collapseOne${
    layerNumber + 1
  }'  >    <h5 id='layerNumberID' class='mb-0'> Layer #${layerNumber}<i        class='fas fa-angle-down rotate-icon'        style='position: absolute; right:0.8em'      ></i>    </h5>  </a></div><!-- Card body --><div  id='collapseOne${
    layerNumber + 1
  }'  class='collapse'  role='tabpanel'  aria-labelledby='headingOne${
    layerNumber + 1
  }'  data-parent='#accordionEx'>  <div class='card-body'> <div  style='display: flex; flex-wrap:wrap; align-content:center; max-width: 21em'>  <select    class='browser-default custom-select modelClassSelect'       style='width: 9em; margin:0 auto; margin-bottom: 2em '  >    <option value='1' selected>Dense</option>    <option value='2'>Conv2D </option>    <option value='3'>Flatten</option>    <option value='4'>Dropout</option>    <option value='5'>MaxPooling2D</option> <option value='6'>batchNormalization</option> </select  >&nbsp;&nbsp; &nbsp;&nbsp;  <div    class='md-form'    style='margin: 0 auto; width: 9em; display:none'  >    <input      type='text'      id='inputShape'      class='form-control'      disabled          />    <label for='inputShape'>inputShape:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 7em; display:none'  >    <input      type='number'      id='kernelSize'      class='form-control'         />    <label for='kernelSize'>kernelSize:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 5em; display:none'  >    <input      type='number'      id='filters'      class='form-control'          />    <label for='filters'>filters:</label>  </div>  <div class='md-form' style='margin: 0 auto; width: 8em; '>    <input      type='text'      id='activation'      class='form-control'          />    <label for='activation'>activation:</label>  </div>  <div class='md-form' style='margin: 0 auto; width: 6em;'>    <input      type='number'      id='units'      class='form-control'         />    <label for='units'>units:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 6em; display:none'  >    <input      type='number'      id='pool_size'      class='form-control'          />    <label for='pool_size'>pool_size:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 6em; display:none'  >    <input      type='number'      max='1'      min='0'      step='0.01'      id='rate'      class='form-control'    />    <label for='rate'>rate:</label>  </div></div><br /><div  style='display: flex; flex-wrap:wrap; align-content:center; max-width: 21em'>  <button    type='button'    class='btn btn-danger '    style='margin: 0 auto; ' id='deleteLayer' >    Delete  </button>  </div></div></div></div><div class='card add' id='add${
    layerNumber + 1
  }' style='width: 25em; height: 2em' title='Add layer'><h4>+</h4></div>`;

  $('#add' + 1).after(newLayerCard);
  $('#headingOne' + (layerNumber + 1)).css('height', '0');
  $('#headingOne' + (layerNumber + 1))
      .after()
      .animate({height: '3em'}, 400);
  layerNumber++;
  let j = 1;
  $('.layersClass')
      .children('.card')
      .each(function() {
      // console.log($(this).html());
        if (
          $(this).attr('id') != 'inputLayer' &&
        $(this).attr('id') != 'outputLayer'
        ) {
          $(this).find('#layerNumberID')
              .each(function() {
                $(this).html(
                    'Layer #' +
                j +
                '<i class=\'fas fa-angle-down rotate-icon\' style=\'position: absolute; right:0.8em\'></i>',
                );
                j++;
                // console.log($(this).html());
              });
        }
      });
  addFuncLayers();

  addCardLayer();
});

function addCardLayer() {
  let i = layerNumber;
  $('body').on('click', '#add' + layerNumber, function() {
    let newLayerCard = ` <div class='card LayerCard' id='Layer${layerNumber}'><!-- Card header --><div class='card-header' role='tab' id='headingOne${
      layerNumber + 1
    }'><a    data-toggle='collapse'    data-parent='#accordionEx'    href='#collapseOne${
      layerNumber + 1
    }'    aria-expanded='false'    aria-controls='collapseOne${
      layerNumber + 1
    }'  >    <h5 id='layerNumberID' class='mb-0'> Layer #${layerNumber}<i        class='fas fa-angle-down rotate-icon'        style='position: absolute; right:0.8em'      ></i>    </h5>  </a></div><!-- Card body --><div  id='collapseOne${
      layerNumber + 1
    }'  class='collapse'  role='tabpanel'  aria-labelledby='headingOne${
      layerNumber + 1
    }'  data-parent='#accordionEx'>  <div class='card-body'> <div  style='display: flex; flex-wrap:wrap; align-content:center; max-width: 21em'>  <select    class='browser-default custom-select modelClassSelect'       style='width: 9em; margin:0 auto; margin-bottom: 2em '  >    <option value='1' selected>Dense</option>    <option value='2'>Conv2D </option>    <option value='3'>Flatten</option>    <option value='4'>Dropout</option>    <option value='5'>MaxPooling2D</option> <option value='6'>batchNormalization</option> </select  >&nbsp;&nbsp; &nbsp;&nbsp;  <div    class='md-form'    style='margin: 0 auto; width: 9em; display:none'  >    <input      type='text'      id='inputShape'      class='form-control'      disabled          />    <label for='inputShape'>inputShape:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 7em; display:none'  >    <input      type='number'      id='kernelSize'      class='form-control'         />    <label for='kernelSize'>kernelSize:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 5em; display:none'  >    <input      type='number'      id='filters'      class='form-control'          />    <label for='filters'>filters:</label>  </div>  <div class='md-form' style='margin: 0 auto; width: 8em; '>    <input      type='text'      id='activation'      class='form-control'          />    <label for='activation'>activation:</label>  </div>  <div class='md-form' style='margin: 0 auto; width: 6em;'>    <input      type='number'      id='units'      class='form-control'         />    <label for='units'>units:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 6em; display:none'  >    <input      type='number'      id='pool_size'      class='form-control'          />    <label for='pool_size'>pool_size:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 6em; display:none'  >    <input      type='number'      max='1'      min='0'      step='0.01'      id='rate'      class='form-control'    />    <label for='rate'>rate:</label>  </div></div><br /><div  style='display: flex; flex-wrap:wrap; align-content:center; max-width: 21em'>  <button    type='button'    class='btn btn-danger '    style='margin: 0 auto; ' id='deleteLayer' >    Delete  </button>  </div></div></div></div><div class='card add' id='add${
      layerNumber + 1
    }' style='width: 25em; height: 2em' title='Add layer'><h4>+</h4></div>`;

    $('#add' + i).after(newLayerCard);
    $('#headingOne' + (layerNumber + 1)).css('height', '0');
    $('#headingOne' + (layerNumber + 1)).after().animate({height: '3em'}, 400);
    layerNumber++;
    renameCorrectLayers();
    addCardLayer();
  });
}

function renameCorrectLayers() {
  let j = 1;
  $('.layersClass').children('.card')
      .each(function() {
      // console.log($(this).html());
        if (
          $(this).attr('id') != 'inputLayer' &&
        $(this).attr('id') != 'outputLayer'
        ) {
          $(this).find('#layerNumberID')
              .each(function() {
                $(this).html(
                    'Layer #' +
                j +
                '<i class=\'fas fa-angle-down rotate-icon\' style=\'position: absolute; right:0.8em\'></i>',
                );
                j++;
                // console.log($(this).html());
              });
        }
      });
  addFuncLayers();
}

function addFuncLayers() {
  $('.LayerCard').each(function() {
    let id = $(this).attr('id');
    // console.log(id);
    $('#' + id).find('.modelClassSelect').first()
        .change(function() {
        // console.log(1);
          if ($(this).val() == 1) {
            $('#' + id)
                .find('#inputShape, #kernelSize, #filters, #pool_size, #rate')
                .parent()
                .css('display', 'none');
            $('#' + id)
                .find('#activation, #units')
                .parent()
                .css('display', 'block');
          } else if ($(this).val() == 2) {
            $('#' + id)
                .find('#inputShape, #units, #pool_size, #rate')
                .parent()
                .css('display', 'none');
            $('#' + id)
                .find('#kernelSize, #filters, #activation')
                .parent()
                .css('display', 'block');
          } else if ($(this).val() == 3) {
            $('#' + id)
                .find(
                    '#inputShape, #units, #pool_size, #rate, #kernelSize, #filters, #activation',
                )
                .parent()
                .css('display', 'none');
          } else if ($(this).val() == 4) {
            $('#' + id)
                .find(
                    '#inputShape, #units, #pool_size, #kernelSize, #filters, #activation',
                )
                .parent()
                .css('display', 'none');
            $('#' + id)
                .find('#rate')
                .parent()
                .css('display', 'block');
          } else if ($(this).val() == 5) {
            $('#' + id)
                .find(
                    '#inputShape, #units, #rate, #kernelSize, #filters, #activation',
                )
                .parent()
                .css('display', 'none');
            $('#' + id)
                .find('#pool_size')
                .parent()
                .css('display', 'block');
          } else {
            $('#' + id)
                .find(
                    '#inputShape, #units, #pool_size, #rate, #kernelSize, #filters, #activation',
                )
                .parent()
                .css('display', 'none');
          }
        });
    $('#' + id).find('#deleteLayer').first()
        .click(function() {
          $('#' + id).next().remove();

          $('#' + id).remove();
          let j = 1;
          $('.layersClass')
              .children('.card')
              .each(function() {
                // console.log($(this).html());
                if (
                  $(this).attr('id') != 'inputLayer' &&
              $(this).attr('id') != 'outputLayer'
                ) {
                  $(this).find('#layerNumberID')
                      .each(function() {
                        $(this).html(
                            'Layer #' +
                      j +
                      '<i class=\'fas fa-angle-down rotate-icon\' style=\'position: absolute; right:0.8em\'></i>',
                        );
                        j++;
                        // console.log($(this).html());
                      });
                }
              });
        });
  });
}


function saveLayers() {
  Layers = [
    tf.layers.conv2d({
      inputShape: [Number($('#datasetNormalWidth').val()), Number($('#datasetNormalHeight').val()), NUM_CHANNELS],
      kernelSize: Number($('#kernelSize').val()),
      filters: Number($('#filters').val()),
      activation: 'relu',
    }),
    tf.layers.dense({units: classes.length, activation: 'softmax'}),
  ];
  $('.LayerCard').each(function() {
    let id = $(this).attr('id');
    let i = 1;
    let select = $('#' + id)
        .find('select option:selected')
        .first()
        .text();
    // console.log(select);

    if (id != 'inputLayer' && id != 'outputLayer') {
      if (select == 'Dense') {
        let activation = $('#' + id)
            .find('#activation')
            .first()
            .val();
        let units = $('#' + id)
            .find('#units')
            .first()
            .val();
        try {
          Layers.splice(
              Layers.length - 1,
              0,
              tf.layers.dense({units: Number(units), activation: activation}),
          );
        } catch (error) {
          alert(error);
        }
      } else if (select == 'Conv2D ') {
        let activation = $('#' + id)
            .find('#activation')
            .first()
            .val();
        let kernelSize = Number(
            $('#' + id)
                .find('#kernelSize')
                .first()
                .val(),
        );
        let filters = Number(
            $('#' + id)
                .find('#filters')
                .first()
                .val(),
        );
        try {
          Layers.splice(
              Layers.length - 1,
              0,
              tf.layers.conv2d({
                kernelSize: kernelSize,
                filters: filters,
                activation: activation,
              }),
          );
        } catch (error) {
          alert(error);
        }
      } else if (select == 'Flatten') {
        Layers.splice(Layers.length - 1, 0, tf.layers.flatten());
      } else if (select == 'batchNormalization') {
        Layers.splice(Layers.length - 1, 0, tf.layers.batchNormalization());
      } else if (select == 'Dropout') {
        let rate = parseFloat(
            $('#' + id)
                .find('#rate')
                .first()
                .val(),
        );
        try {
          Layers.splice(
              Layers.length - 1,
              0,
              tf.layers.dropout({
                rate: rate,
              }),
          );
        } catch (error) {
          alert(error);
        }
      } else if (select == 'MaxPooling2D') {
        let poolSize = Number(
            $('#' + id)
                .find('#pool_size')
                .first()
                .val(),
        );

        try {
          Layers.splice(
              Layers.length - 1,
              0,
              tf.layers.maxPooling2d({
                poolSize: [poolSize, poolSize],
              }),
          );
        } catch (error) {
          alert(error);
        }
      }
    }
  });
  console.log(Layers);
}

let optimizer = tf.train.adam();

$('#optimize').change(function() {
  let selected = $(this).val();
  if ((selected = 1)) optimizer = tf.train.adam();
  else if ((selected = 2)) optimizer = tf.train.adadelta();
  else if ((selected = 3)) optimizer = tf.train.adagrade();
  else if ((selected = 4)) optimizer = tf.train.adamax();
  else if ((selected = 5)) optimizer = tf.train.ftrl();
  else if ((selected = 6)) optimizer = tf.train.nadam();
  else if ((selected = 7)) optimizer = tf.train.rmsprop();
  else if ((selected = 8)) optimizer = tf.train.sgd();

  Params.optimizer = optimizer;
});

let shuffle = true;

$('#shuffle').change(function() {
  if ($(this).is(':checked')) {
    shuffle = true;
    Params.shuffle = shuffle;
  } else {
    shuffle = false;
    Params.shuffle = shuffle;
  }
});

Params = {
  optimizer: optimizer,
  batchSize: 512,
  epochs: 20,
  shuffle: shuffle,
};

$('#userTrain').click(function() {
  saveLayers();
  // $('#loading').css('display', 'flex');
  // let selectedValue = $('#modelSelect').val();
  Params.epochs = $('#epochs').val();
  Params.batchSize = $('#batchSize').val();
  // console.log($("#batchSize").val());
  try {
    run(Layers, Params);
  } catch (error) {
    $('#loading').css('display', 'none');
    alert(error);
  }
});
