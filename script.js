var session;
var options = {};
var ua = null;
var uaStatus = document.getElementById('ua-status');
var uaIP = document.getElementById('ip');
var uaPort = document.getElementById('port');
var uaUser = document.getElementById('user');
var uaPass = document.getElementById('pass');
var uaTo = document.getElementById('to');
var uaRegister = document.getElementById('reg');
var uaUnregister = document.getElementById('unreg');
var uaName = document.getElementById('name');

function register() {

    var config = {
        uri: 'sip:' + uaUser.value + '@' + uaIP.value, 
        wsServers: 'ws://' + uaIP.value + ':' + uaPort.value, 
        authorizationUser: uaUser.value, 
        password: uaPass.value,
        traceSip: true,
        displayName: uaName.value,
        stunServers: ["stun:null"],
        

    };

    ua = new SIP.UA(config);

    ua.on('registered', function () {
        uaStatus.innerHTML = 'Телефон зарегистрирован';
        uaUnregister.style.display = 'block';
        uaRegister.style.display = 'none';
    })

}

function unregister() {

    var config = {
        uri: 'sip:' + uaUser.value + '@' + uaIP.value, 
        wsServers: 'ws://' + uaIP.value + ':' + uaPort.value, 
        authorizationUser: uaUser.value, 
        password: uaPass.value,
        traceSip: true,
        displayName: uaName.value,
        stunServers: ["stun:null"],

    };

    ua.unregister(options);

    ua.on('unregistered', function () {
        uaStatus.innerHTML = 'Телефон не зарегистрирован';
        uaUnregister.style.display = 'none';
        uaRegister.style.display = 'block';
    })

}

var connected = false;

function call() {

    question = uaTo.value;
    //Скрываем все кнопки вызова
    var startCallButtons = document.getElementsByClassName('call-button');
    for (var i = 0; i < startCallButtons.length; i++) {
        startCallButtons[i].style.display = 'none';
    }

    //Показываем кнопку завершения текущего вызова
    endCallButton = document.getElementById('end');
    endCallButton.style.display = 'block';

    options = {
        media: {
            constraints: {
                audio: true,
                video: false
            },
            render: {
                remote: {
                    audio: document.getElementById('remote')
                },
                local: {
                    audio: document.getElementById('local')
                }
            }
        }
    };

    //if (!ua) {
    //    ua = new SIP.UA(config);
    //}
    
    session = createSession(question);
    session.on('progress', function(response){
        uaStatus.innerHTML = 'Идет вызов';
    });
    session.on('accepted', function(response){
        uaStatus.innerHTML = 'Клиент ответил';
        connected = true;
    });
    session.on('failed', function(request) {
        uaStatus.innerHTML = 'Ошибка соединения: ' + request.reason_phrase;
        endCall(question, true);
        connected = false;
    });
    session.on('cancel', function(request) {
        uaStatus.innerHTML = 'Вызов отменен'
        endCall(question, true);
        connected = false;
    });
    session.on('bye', function(request) {
        uaStatus.innerHTML = 'Вызов завершен';
        endCall(question, true);
        connected = false;
    });
}

function endCall(question, bye) {
    //Показываем кнопки вызова
    var startCallButtons = document.getElementsByClassName('call-button');
    for (var i = 0; i < startCallButtons.length; i++) {
        startCallButtons[i].style.display = 'block';
    }
    //Скрываем все кнопки завершения вызова
    var endCallButtons = document.getElementsByClassName('end-call-button');
    for (var i = 0; i < endCallButtons.length; i++) {
        endCallButtons[i].style.display = 'none';
    }
    if (!bye) {
        if (connected) {
            session.bye()
        } else {
            session.cancel();
        }
    }
    session = null;
}

function createSession(question) {
    return ua.invite('sip:' + question, options);  //Здесь 5.45.119.118 - это айпи SIP софтсвича
}
