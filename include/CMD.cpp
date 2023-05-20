#include <iostream>

#include "File.cpp"

class CMD
{
private:
    std::string path;
    File* file;

    void loadFunction()
    {

    }
public:
    CMD(std::string path);
};

CMD::CMD(std::string path)
{
    this->path = path;
    this->file = new File(path);
}