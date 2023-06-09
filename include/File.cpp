#ifndef FILE_H
#define FILE_H

#include <iostream>
#include <fstream>
#include <direct.h>
#include "YamlMin/Node.hpp"
#include "YamlMin/Type.hpp"


void createFile(const char* path)
{
    std::ofstream file(path);
    file.close();
}
void createFolder(const char* path)
{
    mkdir(path);
}
void deleteFile(const char* path)
{
    std::remove(path);
}
void deleteFolder(const char* path)
{
    rmdir(path);
}
bool isExist(const char* path)
{
    std::ifstream file;
    file.open(path);

    if(file)
    {
        return true;
    }else
    {
        return false;
    }
}
void writeYamlContent(const char* path, YamlNode data)
{
    data.write(path);
}

YamlNode getYamlContent(const char* path)
{
    YamlNode node;

    node.read(path);

    return node;
}

#endif