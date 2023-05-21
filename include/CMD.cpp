#include <iostream>
#include <bits/stdc++.h>

#include "File.cpp"
#include "String.cpp"

class CMD
{
private:
    const char* path;
    File* file;

    void loadFunction()
    {

    }
public:
    bool isRunning = true;

    CMD(const char* path);
    char* parseExec(const char* cmdStr);
};

CMD::CMD(const char* path)
{
    this->path = path;
    this->file = new File(path);

    if(not this->file->isExist(path))
    {
        this->file->createFolder(path);
    }
}

void CMD::parseExec(const char* cmdStr)
{
    int countSplit = splitSize(cmdStr, ' ');
    char* argvs[countSplit];
    for (int i = 0; i < countSplit; i++)
    {
        argvs[i] = split(cmdStr, 0, ' ', i);
    }
    char* func = argvs[0];
    delete argvs[0];
    std::cout << func << std::endl;
}