#include <iostream>
#include <cstring>

char* split(const char* str, char delimiter, int pos)
{
	char tv[100][255];
	int index = 0;
	int index2 = 0;
	for (int i = 0; i < strlen(str); i++)
	{
		char c = str[i];
		if(c == delimiter)
		{
			index++;
			index2 = 0;
		}else
		{
			tv[index][index2] = c;
			index2++;
		}
	}
	if(pos > (index + 1))
	{
		return NULL;
	}

	char* result = tv[pos];

    return result;
}
int splitSize(const char* str, char delimiter)
{
	char tv[100][255];
	int index = 0;
	int index2 = 0;
	for (int i = 0; i < strlen(str); i++)
	{
		char c = str[i];
		if(c == delimiter)
		{
			index++;
			index2 = 0;
		}else
		{
			tv[index][index2] = c;
			index2++;
		}
	}

	return (index + 1);
}

std::string splitString(std::string str, char delimiter, int pos)
{
	char tv[100][255];
	int index = 0;
	int index2 = 0;
	for (int i = 0; i < str.length(); i++)
	{
		char c = str.at(i);
		if(c == delimiter)
		{
			index++;
			index2 = 0;
		}else
		{
			tv[index][index2] = c;
			index2++;
		}
	}
	if(pos > (index + 1))
	{
		return NULL;
	}

	char* result = tv[pos];

	std::string resultString(result);

    return resultString;
}
int splitSizeString(std::string str, char delimiter)
{
	char tv[100][255];
	int index = 0;
	int index2 = 0;
	for (int i = 0; i < str.length(); i++)
	{
		char c = str.at(i);
		if(c == delimiter)
		{
			index++;
			index2 = 0;
		}else
		{
			tv[index][index2] = c;
			index2++;
		}
	}

	return (index + 1);
}

void removeElementFromTable(auto table[], int index, int size)
{
	if (index < 0 || index > size) {
        return;
    }

	for (int i = index; i < size - 1; i++) {
        table[i] = table[i + 1];
    }

    if((size - 1) == 0)
    {
    	table = NULL;
    }
}