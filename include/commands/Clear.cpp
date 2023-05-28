#include <stdlib.h>
#include <iostream>
#include "Template.cpp"

#include "../File.cpp"
#include "../CMD.cpp"

class Clear : public Template
{
private:
	const char* path;
public:
	Clear(const char* path)
	{
		this->name = "clear";
		this->description = "clear the environment";
		this->useHelp = {"clear", "clean"};
		this->alias = {"clean"};
		this->isConnecUserToExec = false;

		this->path = path;

		commands.push_back(this);
	}

	void run(std::vector<char*> argvs) override
	{
		//deleteFolder(this->path);
	}
};