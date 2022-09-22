# Pi Pico REST CPU Temperature

In this repository, I develop a MicroPython program implementing a Pi Pico CPU
temperature probe that regularly sends the collected readings to a REST service.

![](pi-pico-w.png)

## Flashing the firmware

The first step to get this working is to flash the Raspberry Pi Pico W with the
MicroPython firmware. It is possible to use C and probably other programming
languages (Rust would be cool), but for something this simple, Python is a good
choice to me.

To download the firmware, visit https://rpf.io/pico-w-firmware. At the time of
writing, this goes to `rp2-pico-w-20220919-unstable-v1.19.1-437-g13c4470fd.uf2`.

To flash the Pi Pico with the UF2 firmware file, disconnect it from the computer
(if you've already plugged it in) and reconnect it while holding the BOOTSEL
button on it. It is the only button on the Pi Pico.

It should should up as a USB mass storage device named `RPI-RP2`. Drag and drop
the UF2 file on it and wait for the file transfer to complete. The Pi Pico will
self-disconnect after.

At this point the Pi Pico W is ready to accept programs to run while powered on.
I use the Thonny IDE as it has built-in support for flashing the programs onto
the Pi Pico W.

## Testing out MicroPython

To make sure MicroPython works as expected, start up Thonny and in the bottom
right corner, make sure *MicroPython (Raspberry Pi Pico)* is selected. If it
doesn't show up, try flashing the board again. If it does show up, but Thonny
prints out an error in the Shell pane and the Run and Debug buttons are greyed
out, switch to *Local Python 3* and back to *MicroPython (Raspberry Pi Pico)*.
This should make the Thonny Pi Pico W connection work and allow you to program
the board.

Next up, go to Tools > Manage Packages in Thonny and install `picozero`. This
package makes it super easy to access the built-in LED and the CPU temperature
reading.

Next up, use this program to validate your ability to upload a program to the Pi
Pico W as well as its ability to connect to a 2.4GHz wireless network.

```python
import network
import socket
from time import sleep
from picozero import pico_temp_sensor, pico_led
import machine

ssid = 'ssid'
password = 'password'

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)
while wlan.isconnected() == False:
    print('Waiting for connection...')
    pico_led.off()
    sleep(1)
    pico_led.on()

print(pico_temp_sensor.temp)
```

This program will flash the on-board LED while the Pi Pico W is attempting to
connect to the wi-fi network and finally keep the LED lit and print the current
CPU temperature to the Shell pane.

When re-deploying the program using the Run button, it seems Thonny/MicroPython
are able to do some sort of hot-reloading or maybe the wi-fi chip stays in the
connected state as long as the board is powered on even while the new versions
of the program are uploaded onto the Pi, so the connection loop will only happen
the first time or after disconnecting and reconnecting the board.

This program is taken from this Pi Pico W site project and cut down a bit:
https://projects.raspberrypi.org/en/projects/get-started-pico-w/0

The Thonny program can stay unsaved, or you can save it on your local drive (but
then it won't be on the Pico W once it restarts) or you can save it on the Pico
W as a file named `main.py` to make the program start up whenever the Pi Pico W
is powered up.

## Setting up the database

I am using Supabase to get a fully-fledged, hosted Postgres instance. On there,
go to the dashboard and create a new project in your organization. I named it
after this repo, `pi-pico-rest-cpu-temp`. Take note of the Supabase database
password, it will be needed later when we set up the Deno function.

In the project, go to the database editor and create a table to collect the
data. I am keeping the default columns (`id`, `created_at`) and adding columns
`recorded_at` (this will be very close temporally to `created_at` but not the
same as it will take some time for the function to write to the database) and
`temperature`. I have also made `created_at` non-nullable. The temperature is
stored as a `float4` numeric type.

With the database set up, it is time to test out connecting to it and writing
some data to it by hand. I am using Postico as a GUI Postgres client to connect
to the backing Postgres database. In Supabase, go to project settings, Database
and find the Host value. That goes to the Host field of the Postico connection.
User is `postgres` and the password is the one chosen while setting up the DB.

![](postico-connection.png)

On the initial connection, Postico will ask you whether you trust the host
certificate:

![](postico-identity.png)

Afterwards, the SQL window in Postico can be used to query the database:

![](postico-query.png)

- [ ] Talk about the Postgres app for macOS and how to use `psql` here

## Recap & To-Do

So far in this guide I've covered:

- [x] Flash the Pi Pico with the MicroPython firmware
- [x] Test out the MicroPython firmare and learn to use Thonny

In order to finalize the implementation of the stated purpose at the top of the
readme, this is what's left to do:

- [ ] Set up a Supabase database for storing the readings
- [ ] Set up a Deno function for persisting the readings
- [ ] Make the POST call with a JSON payload
- [ ] Run the program on in a loop to collect readings over time
- [ ] Measure power draw over a period of time for comparison
- [ ] Implement wi-fi sleep mode for power saving
- [ ] Compare power draw with the sleep mode on
- [ ] Implement wi-fi disconnect and reconnect as an alternative to wi-fi sleep
- [ ] Compare power draw with the other two solutions
