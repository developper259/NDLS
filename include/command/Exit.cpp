#include <stdlib.h>

#include "Template.cpp"

class Exit : public Template
{
public:
	Exit();
	bool Run(char* argvs[]);
};

Exit::Exit()
{
	this->name = "exit";
	this->description = "exit the program";
	this->isConnecUserToExec = false;
}

bool Exit::Run(char* argvs[])
{
	exit(0);
}