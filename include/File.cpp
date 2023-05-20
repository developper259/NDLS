#include <iostream>
#include <fstream>
#include <direct.h>

class File
{
private:
    std::string path;
public:
    File(std::string path);

    void createFile(const char* path);
    void createFolder(const char* path);
    void deleteFile(const char* path);
    void deleteFolder(const char* path);
};

File::File(std::string path)
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