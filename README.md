# Android Install

1. Download the Android SDK

[http://developer.android.com/sdk/index.html?hl=sk]


2. Follow the following instructions

•	Open the Terminal program (this is in your Applications/Utilites folder by default).
•	Run the following command
touch ~/.bash_profile; open ~/.bash_profile
•	This will open the file in the your default text editor.
•	You need to add the path to your Android SDK platform-tools and tools directory. In my example I will use "/Development/android-sdk-macosx" as the directory the SDK is installed in. Add the following line:
export PATH=${PATH}:/Development/android-sdk-macosx/platform-tools:/Development/android-sdk-macosx/tools
•	Save the file and quit the text editor.
•	Execute your .bash_profile to update your PATH.
source ~/.bash_profile
•	Now everytime you open the Terminal program you PATH will included the Android SDK.

Original from the following link:[http://docs.phonegap.com/en/2.8.0/guide\_getting-started\_android\_index.md.html#Getting%20Started%20with%20Android]