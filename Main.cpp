#include <iostream>

#include "include/CMD.cpp"

int main(int argc, char const *argv[])
{
    CMD* cmd = new CMD("data/");

    while(cmd->isRunning)
    {
        std::string cmdU;

        std::cout << "$ "; std::getline(std::cin, cmdU);

        if(cmdU != "")
        {
            cmd->parseExec(cmdU);
        }
    }

    return 0;
}
