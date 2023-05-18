let ws,
    heartbeat=false,
    hbinterval=1000;

function connected(){
    document.getElementById("status").classList.add("connected");
    document.getElementById("connectionbtn").innerText="discommect";
    document.getElementById("connectionbtn").onclick=disconnect;
}
function disconnected(){
    document.getElementById("status").classList.remove("connected");
    document.getElementById("connectionbtn").innerText="commect";
    document.getElementById("connectionbtn").onclick=connect;
}

function disconnect(){
    ws.close();
    disconnected();
}

class sensor{
    constructor(name,id,format="%v"){
        this.name=name;
        this.format=format;
        this.id=id;
        document.getElementById("sensorbar").append(document.createElement("sensor"));
        document.getElementById("sensorbar").lastChild.id="sensor"+this.id;
        this.display(undefined);
    }
    display(value){
        document.getElementById("sensor"+this.id).innerText=`${this.name} ${this.format.replace("%v",value)}`;
    }
}

let sensormap=[
    new sensor("temp", 0)
];


function connect(){
    ws = new WebSocket(document.getElementById("wsadr").value);
    heartbeat=true;
    ws.onmessage=function(msg){
        let json=JSON.parse(msg.data);

        switch(json.cmd){
            case "sensor":
                sensormap[json.id].display(json.value);
                break;
            case "heartbeat":
                heartbeat=true;
                break;
        }
    }
    ws.onclose=function(){
        disconnected();
        delete ws;
    }
}

window.setInterval(function(){
    if(!ws || ws.readyState!=ws.OPEN) return;
    if(!heartbeat){
        console.error(`HEARTBEAT: no heartbeat detected in the last ${hbinterval/1000}s! closing websocket...`);
        ws.close();
        disconnected();
        return;
    }else{
        connected();
    }
    heartbeat=false;
    ws.send(JSON.stringify({cmd:"heartbeat"}));
},hbinterval);

function sendcommand(args){
    console.log(args);
    ws.send(JSON.stringify(args))
}

//motor setup

//   pos       neg
//0: forward / backward
//1: right    / left
//3: up      / down
//6: pit forw/ pit backw
//7: roll lef/ roll righ
//8: yaw left/ yaw right

document.onkeydown=function (e){
    if(e.key=="w"){
        sendcommand({cmd:"setmotor", index:0 ,speed:100});
    }
    if(e.key=="a"){
        sendcommand({cmd:"setmotor", index:1 ,speed:-100});
    }
    if(e.key=="s"){
        sendcommand({cmd:"setmotor", index:0 ,speed:-100});
    }
    if(e.key=="d"){
        sendcommand({cmd:"setmotor", index:1 ,speed:100});
    }

    if(e.key=="r"){
        sendcommand({cmd:"setmotor", index:3 ,speed:100});
    }
    if(e.key=="f"){
        sendcommand({cmd:"setmotor", index:3 ,speed:-100});
    }
}

document.onkeyup=function (e){
    if(e.key=="w"){
        sendcommand({cmd:"setmotor", index:0 ,speed:0});
    }
    if(e.key=="a"){
        sendcommand({cmd:"setmotor", index:1 ,speed:0});
    }
    if(e.key=="s"){
        sendcommand({cmd:"setmotor", index:0 ,speed:0});
    }
    if(e.key=="d"){
        sendcommand({cmd:"setmotor", index:1 ,speed:0});
    }

    if(e.key=="r"){
        sendcommand({cmd:"setmotor", index:3 ,speed:0});
    }
    if(e.key=="f"){
        sendcommand({cmd:"setmotor", index:3 ,speed:0});
    }
}

