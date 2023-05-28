#ifndef CONFIG_H
#define CONFIG_H

#include <iostream>

#include "YamlMin/Node.hpp"
#include "YamlMin/Type.hpp"

#include "File.cpp"

//file name
std::string CONFIG_FILENAME = "config.yaml";

//global variable
std::string VERSION = "v0.0.0.1-beta";

//global user variable
std::string FAVORITE_EDITOR = "";
bool ORGANISATION_BY_LANGAGE = true;

bool isExistConfigFile(const char* path)
{
	std::string p(path);
	std::string filename = p + CONFIG_FILENAME;

	if(isExist(filename.c_str())){
		return true;
	}else
	{
		return false;
	}
}

void loadConfigFile(const char* path)
{
	std::string p(path);
	std::string filename = p + CONFIG_FILENAME;

	YamlNode data = getYamlContent(filename.c_str());
	
	FAVORITE_EDITOR = data["favorite_editor"].getString();
	ORGANISATION_BY_LANGAGE = data["organisation_by_langage"].getBool();

	std::cout << FAVORITE_EDITOR << std::endl << ORGANISATION_BY_LANGAGE;
}

void initConfigFile(const char* path)
{
	std::string p(path);
	std::string filename = p + CONFIG_FILENAME;

	createFile(filename.c_str());

	YamlNode data;


	data["favorite_editor"] = FAVORITE_EDITOR;
	data["organisation_by_langage"] = ORGANISATION_BY_LANGAGE;

	//writeYamlContent(filename.c_str(), data);
}

void initConfig(const char* path)
{
	if(isExistConfigFile(path))
	{
		loadConfigFile(path);
	}
}

#endif