using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Reflection;

namespace API.ModelBinders;

public class EnumModelBinder : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        var value = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);
        
        if (value == ValueProviderResult.None)
        {
            return Task.CompletedTask;
        }

        bindingContext.ModelState.SetModelValue(bindingContext.ModelName, value);

        var stringValue = value.FirstValue;
        
        if (string.IsNullOrEmpty(stringValue))
        {
            return Task.CompletedTask;
        }

        var modelType = bindingContext.ModelType;
        
        if (modelType.IsEnum)
        {
            // Try to parse as integer first
            if (int.TryParse(stringValue, out var intValue))
            {
                if (Enum.IsDefined(modelType, intValue))
                {
                    bindingContext.Result = ModelBindingResult.Success(Enum.ToObject(modelType, intValue));
                    return Task.CompletedTask;
                }
            }
            
            // Try to parse as string
            if (Enum.TryParse(modelType, stringValue, true, out var enumValue))
            {
                bindingContext.Result = ModelBindingResult.Success(enumValue);
                return Task.CompletedTask;
            }
        }

        bindingContext.ModelState.TryAddModelError(bindingContext.ModelName, 
            $"Cannot convert '{stringValue}' to {modelType.Name}.");
        
        return Task.CompletedTask;
    }
}
