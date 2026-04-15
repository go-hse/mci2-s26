@echo off

:: copy this script in the scrcpy-directory
:: start with double click in explorer

echo Script Version 15.04.2026

echo dev=adb devices
echo rev=adb reverse tcp:3000 tcp:3000
echo rmv=adb reverse --remove-all
echo lsv=adb shell ls /sdcard/Oculus/VideoShots
echo lss=adb shell ls /sdcard/Oculus/ScreenShots
echo scs=scrcpy -m1024 

doskey dev=adb devices

:: adb reverse tcp:{{remote_port}} tcp:{{local_port}}
doskey rev=adb reverse tcp:3000 tcp:3000
doskey rmv=adb reverse --remove-all

:: adb reverse --list

doskey lsv=adb shell ls /sdcard/Oculus/VideoShots
doskey lss=adb shell ls /sdcard/Oculus/ScreenShots
doskey kll=adb kill-server


set HERE=%~dp0
cd /D %HERE%

echo We are in %HERE%

adb devices

@cmd
