#include <stdlib.h>
#include <iostream>

#include "Template.cpp"

#include "../CMD.cpp"

class Version : public Template
{
public:
	Version()
	{
		this->name = "version";
		this->description = "show the version of NDLS terminal";
		this->useHelp = {"version", "v"};
		this->alias = {"v"};
		this->isConnecUserToExec = false;

		commands.push_back(this);
	}

	void run(std::vector<char*> argvs) override
	{
		std::cout << VERSION << std::endl;
	}
};