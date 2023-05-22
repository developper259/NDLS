#include <iostream>
#include <bits/stdc++.h>

#include <typeinfo>

#include "File.cpp"
#include "addFunction.cpp"

#include "commands/Template.cpp"

#include "commands/Exit.cpp"
#include "commands/Help.cpp"

class CMD
{
private:
    const char* path;
    File* file;

public:
    bool isRunning = true;


    CMD(const char* path);
    void parseExec(std::string cmdStr);
    void execute(std::string f, std::string a[]);
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