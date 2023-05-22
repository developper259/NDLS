#include <stdlib.h>
#include <iostream>

#include "Template.cpp"

class Help : public Template
{
public:
	Help()
	{
		this->name = "help";
		this->description = "show this content";
		this->useHelp = {"help", "h"};
		this->alias = {"h"};
		this->isConnecUserToExec = false;

		commands.push_back(this);
	}

	void run(std::string argvs[]) override
	{
		for(Template* command : commands)
		{
			std::cout << "  " << command->name << " : " << command->description << std::endl ;

			for(std::string methode : command->useHelp)
			{
				std::cout << "    " << methode << std::endl;
			}
		}
	}
};

Help* h = new Help();