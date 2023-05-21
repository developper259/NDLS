#include <stdlib.h>

#include "Template.cpp"

class Exit : public Template
{
public:
	Exit()
	{
		this->name = "exit";
		this->description = "exit the program";
		this->useHelp = {"exit"};
		this->alias = {};
		this->isConnecUserToExec = false;
	}

	void run(std::string argvs[])
	{
		exit(0);
	}
};
