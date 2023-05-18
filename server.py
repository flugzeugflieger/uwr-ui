#!/usr/bin/env python

import asyncio, time, json, random
from websockets.server import serve

auxPorts = []

def setMotor(id, speed):
    print("set motor "+ str(id) +" to speed "+ str(speed))

def setAuxPort(id, value):
    auxPorts[int(id)](value)

def registerAuxPort(callback):
    auxPorts.append(callback)

#test
def test(a):
    print(a)

async def setSensor(id, value):
    retour={
        "cmd":"sensor",
        "id":str(id),
        "value":str(value)
        }
    await ws.send(json.dumps(retour))

registerAuxPort(test)


async def echo(websocket):
    global ws
    ws = websocket
    async for message in websocket:
        msg=json.loads(message)
        if(msg["cmd"]=="setmotor"):
            setMotor(int(msg["index"]), int(msg["speed"]))
        if(msg["cmd"]=="setaux"):
            setAuxPort(int(msg["index"]), msg["value"])
        if(msg["cmd"]=="heartbeat"):
            await ws.send('{"cmd":"heartbeat"}')
        await setSensor(0,random.randint(0,100))

async def main():
    async with serve(echo, "localhost", 8765):
        await asyncio.Future()  # run forever

asyncio.run(main())
