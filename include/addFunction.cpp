#include <iostream>
#include <cstring>

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