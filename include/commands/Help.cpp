#include <stdlib.h>

#include "Template.cpp"

class Help : public Template
{
private:
	std::vector<Template> commands;
public:
	Help(std::vector<Template> commands)
	{
		this->name = "help";
		this->description = "show this content";
		this->useHelp = {"help", "h"};
		this->alias = {"h"};
		this->isConnecUserToExec = false;

		this->commands = commands;
	}

	void run(std::string argvs[])
	{
		for(Template command : this->commands)
		{
			std::cout << "  " << command.name << " : " << command.description << std::endl ;

			for(std::string methode : command.useHelp)
			{
				std::cout << "    " << methode << std::endl;
			}
		}
	}
};
