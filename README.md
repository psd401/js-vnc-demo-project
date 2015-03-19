js-vnc-demo-project
===================

Peninsula School District is researching the possibility of using a JS VNC client for IT helpdesk as a Meraki replacement. Goals to create a flexible Knockout JS component out of this.

Changes
=========

- Added more events to the client
  - **Mouse move:** Follow the mouse around the canvas
  - **Right Click:** Right click the canvas to send right click to VNC
  - **Click and drag:** Right or left click drag sent to the VNC client
- Switched to [node-jpeg](https://github.com/pkrumins/node-jpeg) for rendering, 50% increased performance. Quality sufferes but still better and more reliable than Meraki!


Plans
=====

- Further optimize performance.
  - Scale down JPEG rendering. Currently sending full HD (1920x1080) at ~250Kb per frame. By scaling image down server side might be able to reduce this by a 90%.
  - Send mouse move data more efficently. Instead of spamming the node proxy with as many events the client can send, send socket.io events after gotten a response on move.
- Support more [rfb2](https://github.com/sidorares/node-rfb2) events. Including copy and paiste on the client.
