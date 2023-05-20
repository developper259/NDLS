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
    CMD(const char* path);
    char* parse(const char* cmdStr);
};

CMD::CMD(const char* path)
{
    this->path = path;
    this->file = new File(path);

    if(not this->file->isExistFile(path))
    {
        this->file->createFolder(path);
    }
}

char* parse(const char* cmdStr)
{
    if(cmdStr != NULL)
    {
        char* func = split(cmdStr, ' ', 0);
    }
}