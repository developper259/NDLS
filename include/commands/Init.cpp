#include <stdlib.h>

#include "Template.cpp"

#include "../CMD.cpp"
#include "../Config.cpp"

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

	void run(std::vector<char*> argvs) override
	{
		if(not isExist(this->path))
		{
			createFolder(this->path);
		}
		initConfigFile(this->path);

	}
};