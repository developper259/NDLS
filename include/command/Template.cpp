#include <iostream>


class Template
{
private:
	char* name;
	char* description;
	bool isConnecUserToExec;

public:
	Template(auto command);

static auto commands[50];
};

Template::Template(auto command)
{
	
}