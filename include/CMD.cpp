#ifndef CMD_H
#define CMD_H

#include <iostream>
#include <bits/stdc++.h>

#include <typeinfo>

#include "File.cpp"
#include "addFunction.cpp"

#include "commands/Template.cpp"

#include "commands/Exit.cpp"
#include "commands/Help.cpp"
#include "commands/Init.cpp"
#include "commands/Clear.cpp"

class CMD
{

public:
    const char* path;
    bool isRunning = true;


    CMD(const char* path);
    void parseExec(std::string cmdStr);
    void execute(std::string f, std::string a[]);
    void loadFunction();
};

CMD::CMD(const char* path)
{
    this->path = path;

    if(not isExist(path))
    {
        createFolder(path);
    }
    this->loadFunction();
}

void CMD::loadFunction()
{
    new Exit();
    new Help();
    new Init(this->path);
    new Clear(this->path);
}


void CMD::parseExec(std::string cmdStr)
{
    int countSplit = splitSizeString(cmdStr, ' ');
    std::string a[countSplit];

    for (int i = 0; i < countSplit; i++)
    {
        a[i] = splitString(cmdStr, ' ', i);
    }
    std::string f = a[0];

    removeElementFromTable(a, 0, countSplit);

    if((countSplit - 1) == 0)
    {
        this->execute(f, NULL);
    }else
    {
        this->execute(f, a);
    }
}

void CMD::execute(std::string f, std::string a[])
{
    for(Template* command : commands)
    {
        auto find = std::find(command->alias.begin(),command->alias.end(), f);
        if(f == command->name || find != command->alias.end())
        {
            command->run(a);
            return;
        }
    }
}

#endif