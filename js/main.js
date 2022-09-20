// Desarrollado por Pedro Lopez
// Enero, 2018

var corsBypassSrv = 'https://corsanywhere.herokuapp.com/';
var postUrl = 'https://evaluacionp.intec.edu.do/Evaluador/GuardarFormulario';

var fecha = new Date();
var evalMonth = fecha.getUTCMonth() == 0 ? 12 : fecha.getUTCMonth();
var evalPeriod = Math.ceil(evalMonth/3);
var getYear = fecha.getFullYear();
var evalYear = evalPeriod === 4 ? getYear - 1 : getYear;


function fillWith(str, fillChar, len, reverse) {
    var toFill = len - str.length;
    for(var i=0; i<toFill; i++) {
        if(reverse) {
            str = fillChar + str;
        } else {
            str += fillChar;
        }
    }

    return str;
}

function generateSerialization(questionId, eval, startIndex, endIndex) {
    var postData = '';

    for(var i=startIndex; i<=endIndex; i++) {
        var fieldName = '&Respuestas%5B'+ i + '%5D.';

        postData += fieldName + 'Id=' + questionId
            + fieldName + 'PreguntaId=' + questionId
            + fieldName + 'Opcionid=' + (parseInt(eval))
            + fieldName + 'Type=Close'
            + fieldName + 'PreguntaId=' + (parseInt(eval));

        questionId++;
    }

    return postData;
}

function generateNoteSerialization(questionId, index, note) {
    var fieldName = '&Respuestas%5B'+ index + '%5D.';
    return fieldName + 'Id=' + questionId
        + fieldName + 'PreguntaId=' + questionId
        + fieldName + 'Opcionid=0'
        + fieldName + 'Type=Open'
        + fieldName + 'OpcionValorText=' + note;
}

$(function() {
    $('#evalForm').submit(function(e) {
        e.preventDefault();

        var id = $('#inputId').val();
        var code = $('#inputCode').val();
        var section = $('#inputSect').val();
        var eval1 = $('input[name=evalRadio]:checked').val();
        var note1 = $('#inputNote1').val();

        // Validate nothing is empty
        if(!id || !code || !section || !note1) {
            alert('Debe llenar todos los campos.');
            return;
        }

        if(!eval1) {
            eval1 = 0;
        }

        // Split code
        var code1 = code.substring(0, 3);
        var code2 = code.substring(3);
        section = fillWith(section, '0', 2, true);

        var fullCode = fillWith(code1, '+', 5) 
                        + fillWith(code2, '+', 5) 
                        + section;

        // Generate post data
        var postData = 'CantRespuestas=20&CantPreguntas=21&'
            + 'Asignatura.Codigo=' + code 
            + '&Asignatura.CodigoCompleto=' + fullCode
            + '&Asignatura.Seccion=' + section
            + '&Asignatura.Ano=' + evalYear
            + '&Asignatura.Periodo=' + evalPeriod
            + '+&Asignatura.Profesor.Id=0&Evaluador.Id=' + id
            + '&EsAdministrativo=False&EstaCompleta=N&EvalId=21';
        
        // Prof questions
        postData += generateSerialization(523, eval1, 0, 19);

        // Prof Note
        postData += generateNoteSerialization(545, 20, note1);

        // Show request message
        console.log(postData);

        $('#resultsTitle').html('Request for: ' + code);
        $('#results').html('Cargando...');

        // Send post
        $.ajax({
            method: 'POST',
            url: corsBypassSrv + postUrl,
            data: postData,
            context: document.body,
            headers: {
                'x-requested-with': 'AutoEval'
            },
            success: function(data) {
                $('#results').html(JSON.stringify(data));
            }
        }).fail(function() {
            $('#results').html('OCURRIÓ UN ERROR AL PROCESAR SU SOLICITUD.');
        });
        
    });
});
