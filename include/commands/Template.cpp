#ifndef TEMPLATE_H
#define TEMPLATE_H

#include <iostream>


class Template
{
public:
	std::string name;
	std::string description;
	std::vector<std::string> useHelp;
	std::vector<std::string> alias;
	bool isConnecUserToExec;
};

#endif