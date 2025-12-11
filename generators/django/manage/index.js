async function standard(ctx = {}) {
  const content = `
#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
`;
  return { type: "single", content };
}

async function production(ctx = {}) {
  const content = `
#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.prod")
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return standard(ctx);
}

module.exports = {
  standard,
  production,
  default: defaultVariant
};
