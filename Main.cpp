#include <iostream>

#include "include/CMD.cpp"

int main(int argc, char const *argv[])
{
    CMD* cmd = new CMD("data/");

    while(cmd->isRunning)
    {
        char* cmd;

        cin >> cmdU;

        if(cmdU != NULL)
        {
            cmd->parseExec(cmdU);
        }
    }

    return 0;
}
