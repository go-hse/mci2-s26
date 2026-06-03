@echo off

echo Script Version 02.12.2025 b

echo dev=adb devices
echo rev=adb reverse tcp:3000 tcp:3000
echo rmv=adb reverse --remove-all
echo lsv=adb shell ls /sdcard/Oculus/VideoShots
echo lss=adb shell ls /sdcard/Oculus/ScreenShots
echo scs=scrcpy -m1024 

echo scr=scrcpy -b 1M --crop=1280:1024:400:200 --angle=22

doskey scs=scrcpy -m1280 --crop=1280:1024:400:200 --angle=22
doskey dev=adb devices

:: adb reverse tcp:{{remote_port}} tcp:{{local_port}}
doskey rev=adb reverse tcp:3000 tcp:3000
doskey rmv=adb reverse --remove-all

:: adb reverse --remove-all
:: adb reverse --list

doskey scr=scrcpy -b 1M --crop=1280:1024:400:200 --angle=22
doskey scm=scrcpy -b 1M --crop=1920:1080:80:400 --angle=22 --record=test.mp4 --video-codec=h264
doskey lsv=adb shell ls /sdcard/Oculus/VideoShots
doskey lss=adb shell ls /sdcard/Oculus/ScreenShots
doskey kll=adb kill-server


set HERE=%~dp0
cd /D %HERE%

echo We are in %HERE%

adb devices

@cmd
