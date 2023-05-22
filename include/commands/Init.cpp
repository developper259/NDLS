#include <stdlib.h>

#include "Template.cpp"

#include "../File.cpp"
#include "../CMD.cpp"

class Init : public Template
{
private:
	const char* path;
public:
	Init(const char* path)
	{
		this->name = "init";
		this->description = "prepare the environment";
		this->useHelp = {"init", "prepare"};
		this->alias = {"prepare"};
		this->isConnecUserToExec = false;

		this->path = path;

		commands.push_back(this);
	}

	void run(std::string argvs[])
	{
		if(not isExist(this->path))
		{
			createFolder(this->path);
		}
		std::string p(this->path);
		// create config file
		std::string filename = p + "config.json";
		createFile(filename.c_str());
	}
};