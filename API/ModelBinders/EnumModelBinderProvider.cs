using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace API.ModelBinders;

public class EnumModelBinderProvider : IModelBinderProvider
{
    public IModelBinder? GetBinder(ModelBinderProviderContext context)
    {
        if (context.Metadata.ModelType.IsEnum)
        {
            return new EnumModelBinder();
        }

        return null;
    }
}
