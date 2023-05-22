#ifndef TEMPLATE_H
#define TEMPLATE_H

#include <iostream>
#include <vector>


class Template
{
public:
	std::string name;
	std::string description;
	std::vector<std::string> useHelp;
	std::vector<std::string> alias;
	bool isConnecUserToExec;

	virtual void run(std::string argvs[]) = 0;
};
std::vector<Template*> commands;

#endif