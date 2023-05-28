#ifndef CMD_H
#define CMD_H

#include <iostream>
#include <bits/stdc++.h>

#include <typeinfo>

#include "File.cpp"
#include "addFunction.cpp"
#include "Config.cpp"

#include "commands/Template.cpp"
#include "commands/Version.cpp"
#include "commands/Exit.cpp"
#include "commands/Help.cpp"
#include "commands/Init.cpp"
#include "commands/Clear.cpp"

#include "YamlMin/Node.hpp"
#include "YamlMin/Type.hpp"
#include "YamlMin/Parser.hpp"

class CMD
{
public:
    const char* path;
    bool isRunning = true;


    CMD(const char* path);
    void parseExec(std::string cmdStr);
    void execute(std::string f, std::vector<char*> argvs);
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

    initConfig(this->path);
}

void CMD::loadFunction()
{
    new Version();
    new Exit();
    new Help();
    new Init(this->path);
    //new Clear(this->path);
}


void CMD::parseExec(std::string cmdStr)
{
    std::vector<char*> a = split(cmdStr.c_str(), ' ');

    std::string f = a[0];

    a.erase(a.begin());

    this->execute(f, a);
}

void CMD::execute(std::string f, std::vector<char*> a)
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