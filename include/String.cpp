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