#include <iostream>
#include <bits/stdc++.h>

#include <typeinfo>

#include "File.cpp"
#include "addFunction.cpp"

#include "commands/Exit.cpp"
#include "commands/Help.cpp"

class CMD
{
private:
    const char* path;
    File* file;
    std::vector<Template> commands;

    void loadFunction();
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

    this->loadFunction();
}

void CMD::loadFunction()
{
    this->commands.push_back(Exit());

    this->commands.push_back(Help(this->commands));
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
    /*for(Template command : this->commands)
    {
        auto find = std::find(command.alias.begin(),command.alias.end(), f);
        if(f == command.name || find != command.alias.end())
        {
            command.run(a);
            return;
        }
    }*/

    if(f == "exit")
    {
        Exit* e = new Exit();
        e->run(a);
    }else if(f == "help" || f == "h")
    {
        Help* h = new Help(this->commands);
        h->run(a);
    }
}