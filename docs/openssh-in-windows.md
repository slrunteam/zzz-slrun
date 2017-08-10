# OpenSSH in Windows

The below instruction is the easiest way to have a SSH server running in Windows. More information can be found at https://github.com/PowerShell/Win32-OpenSSH/wiki/Install-Win32-OpenSSH.

1. Download the latest release of [OpenSSH for Windows](https://github.com/PowerShell/Win32-OpenSSH/releases) (Win32 or Win64)
2. Extract the content to your file system, such as in `C:\Program Files\OpenSSH`
3. Run Windows Command Line (cmd) as Administrator and navigate to the above installation folder
4. Generate SSH host keys
```
.\ssh-keygen.exe -A
```
5. Start OpenSSH server
```
.\sshd
```
