#include <stdlib.h>
#include <iostream>

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

		commands.push_back(this);
	}

	void run(std::vector<char*> argvs) override
	{
		exit(0);
	}
};