#include <iostream>
#include <fstream>
#include <direct.h>

class File
{
private:
    const char* path;
public:
    File(const char* path);

    void createFile(const char* path);
    void createFolder(const char* path);
    void deleteFile(const char* path);
    void deleteFolder(const char* path);
    bool isExistFile(const char* path);
};

File::File(const char* path)
{
    this->path = path;
}

void File::createFile(const char* path)
{
    std::ofstream file(path);
    file.close();
}
void File::createFolder(const char* path)
{
    mkdir(path);
}
void File::deleteFile(const char* path)
{
    std::remove(path);
}
void File::deleteFolder(const char* path)
{
    rmdir(path);
}
bool File::isExistFile(const char* path)
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