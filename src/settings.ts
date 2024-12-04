// ./src/settings.ts

import {
  App,
  Notice,
  PluginSettingTab,
  Setting,
  normalizePath,
} from "obsidian";

import CardsViewPlugin from "../main";

export enum TitleDisplayMode {
  Both = "Both",
  Title = "Title",
  Filename = "Filename",
}

export enum DeleteFileMode {
  System = "system",
  Trash = "trash",
  Permanent = "perm",
}

export enum NoteOpenLayout {
  Right = "right",
  NewTab = "tab",
  NewWindow = "window",
}

export enum TagPostionForCardColor {
  frontmatter = "frontmatter",
  content = "content",
}

export interface TagSetting {
  name: string;
  color: string;
}
export enum Sort {
  NameAsc = "Title (A-Z)",
  NameDesc = "Title (Z-A)",
  EditedDesc = "Edited (Newest First)",
  EditedAsc = "Edited (Oldest First)",
  CreatedDesc = "Created (Newest First)",
  CreatedAsc = "Created (Oldest First)",
}

export interface CardsViewSettings {
  minCardWidth: number;
  maxCardHeight: number | null;
  launchOnStart: boolean;
  showDeleteButton: boolean;
  displayTitle: TitleDisplayMode;
  showEmptyNotes: boolean;
  showSubFolders: boolean;
  showParentFolder: boolean;
  toSystemTrash: DeleteFileMode;
  openNoteLayout: NoteOpenLayout;
  tagPositionForCardColor: TagPostionForCardColor;
  pinnedFiles: string[];
  tagColors: TagSetting[];
  defaultSort: Sort;
  openViewOnFolderClick: boolean;
  excludedFolders: string[];
}

export const DEFAULT_SETTINGS: CardsViewSettings = {
  minCardWidth: 200,
  maxCardHeight: null,
  launchOnStart: false,
  showDeleteButton: true,
  displayTitle: TitleDisplayMode.Both,
  showEmptyNotes: false,
  showSubFolders: false,
  showParentFolder: true,
  toSystemTrash: DeleteFileMode.System,
  openNoteLayout: NoteOpenLayout.Right,
  tagPositionForCardColor: TagPostionForCardColor.content,
  pinnedFiles: [],
  tagColors: [],
  defaultSort: Sort.EditedDesc,
  openViewOnFolderClick: false,
  excludedFolders: [],
};

export class CardsViewSettingsTab extends PluginSettingTab {
  plugin: CardsViewPlugin;
  tempFolderName: string;

  constructor(app: App, plugin: CardsViewPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.tempFolderName = "";
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Launch on start")
      .setDesc("Open the cards view when Obsidian starts")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.launchOnStart)
          .onChange(async (value) => {
            this.plugin.settings.launchOnStart = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl).setName("Cards UI").setHeading();

    new Setting(containerEl)
      .setName("Title display mode")
      .setDesc("What to display on cards starting with a # Level 1 title")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            [TitleDisplayMode.Both]: "Both title and filename",
            [TitleDisplayMode.Title]: "Title",
            [TitleDisplayMode.Filename]: "Filename",
          })
          .setValue(this.plugin.settings.displayTitle)
          .onChange(async (value) => {
            this.plugin.settings.displayTitle = value as TitleDisplayMode;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Minimum card width")
      .setDesc("Cards will not be smaller than this width (in pixels)")
      .addText((text) =>
        text
          .setPlaceholder("200")
          .setValue(this.plugin.settings.minCardWidth.toString())
          .onChange(async (value) => {
            if (isNaN(parseInt(value))) {
              new Notice("Invalid number");
              return;
            }

            this.plugin.settings.minCardWidth = parseInt(value);
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Maximum card height")
      .setDesc(
        "Set the maximum height of the card in pixels (leave blank for no restriction)"
      )
      .addText((text) =>
        text
          .setPlaceholder("e.g., 300")
          .setValue(this.plugin.settings.maxCardHeight?.toString() || "")
          .onChange(async (value) => {
            if (value.trim() === "") {
              this.plugin.settings.maxCardHeight = null;
            } else if (!isNaN(parseInt(value))) {
              this.plugin.settings.maxCardHeight = parseInt(value);
            } else {
              new Notice("Invalid number");
              return;
            }
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Show delete button")
      .setDesc(
        "Disable this option to remove the delete button, so you dont delete any note accidentally."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showDeleteButton)
          .onChange(async (value) => {
            this.plugin.settings.showDeleteButton = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Show parent folder name")
      .setDesc(
        "Disable this option to hide the parent folder from showing on the cards. Visible on mouse hover."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showParentFolder)
          .onChange(async (value) => {
            this.plugin.settings.showParentFolder = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl).setName("Genearl features").setHeading();

    // new Setting(containerEl)
    //   .setName("Open view on tag click from Tag Tree")
    //   .setDesc(
    //     "Enable this if you want to see all the notes in cards view, which has the tag you just clicked from the tag tree."
    //   )
    //   .addToggle((toggle) =>
    //     toggle
    //       .setValue(this.plugin.settings.openViewOnTagTreeClick)
    //       .onChange(async (value) => {
    //         this.plugin.settings.openViewOnTagTreeClick = value;
    //         await this.plugin.saveSettings();
    //       })
    //   );

    // new Setting(containerEl)
    //   .setName("Open view on tag click from inline Tag")
    //   .setDesc(
    //     "Enable this if you want to see all the notes in cards view, which has the tag you just clicked from the in file tag."
    //   )
    //   .addToggle((toggle) =>
    //     toggle
    //       .setValue(this.plugin.settings.openViewOnInlineTagClick)
    //       .onChange(async (value) => {
    //         this.plugin.settings.openViewOnInlineTagClick = value;
    //         await this.plugin.saveSettings();
    //       })
    //   );

    new Setting(containerEl)
      .setName("Open view on folder click")
      .setDesc(
        "Enable this if you want to open the cards view with all the notes from a folder, when you will click on the folder from file explorer. You also have same option using file munu, if you dont like this feature."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.openViewOnFolderClick)
          .onChange(async (value) => {
            this.plugin.settings.openViewOnFolderClick = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Deleted files")
      .setDesc("What happens to a file after you delete it.")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            [DeleteFileMode.System]: "Move to system trash",
            [DeleteFileMode.Trash]: "Move to vault trash folder (.trash)",
            [DeleteFileMode.Permanent]: "Permanently delete",
          })
          .setValue(this.plugin.settings.toSystemTrash)
          .onChange(async (value) => {
            this.plugin.settings.toSystemTrash = value as DeleteFileMode;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Open note layout")
      .setDesc("Where should the note open.")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            [NoteOpenLayout.Right]: "Open note on right side",
            [NoteOpenLayout.NewTab]: "Open note in new tab",
            [NoteOpenLayout.NewWindow]: "Open note in new window",
          })
          .setValue(this.plugin.settings.openNoteLayout)
          .onChange(async (value) => {
            this.plugin.settings.openNoteLayout = value as NoteOpenLayout;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl).setName("Cards color based on tag").setHeading();

    new Setting(containerEl)
      .setName("Where do you place the tags")
      .setDesc(
        "If you use frontmatter then create a property 'tags' and enter your tag name as value."
      )
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            [TagPostionForCardColor.content]: "In content",
            [TagPostionForCardColor.frontmatter]: "In frontmatter",
          })
          .setValue(this.plugin.settings.tagPositionForCardColor)
          .onChange(async (value) => {
            this.plugin.settings.tagPositionForCardColor =
              value as TagPostionForCardColor;
            await this.plugin.saveSettings();
          })
      );

    this.plugin.settings.tagColors.forEach((tag, index) => {
      const setting = new Setting(containerEl)
        .addText((text) =>
          text
            .setPlaceholder("Tag Name")
            .setValue(tag.name)
            .onChange(async (value) => {
              this.plugin.settings.tagColors[index].name = value;
              await this.plugin.saveSettings();
            })
        )
        .addColorPicker((text) =>
          text.setValue(tag.color).onChange(async (value) => {
            this.plugin.settings.tagColors[index].color = value;
            await this.plugin.saveSettings();
          })
        )
        .addButton((button) =>
          button
            .setButtonText("Delete")
            .setCta()
            .onClick(async () => {
              this.plugin.settings.tagColors.splice(index, 1);
              await this.plugin.saveSettings();
              this.display();
            })
        );
    });

    new Setting(containerEl).addButton((button) =>
      button
        .setButtonText("Add Tag")
        .setCta()
        .onClick(async () => {
          this.plugin.settings.tagColors.push({ name: "", color: "" });
          await this.plugin.saveSettings();
          this.display();
        })
    );

    new Setting(containerEl)
      .setName("Exclude Folders")
      .setDesc("Add folders to exclude from the board")
      .addText((text) =>
        text.setPlaceholder("Enter folder path").onChange((value) => {
          this.tempFolderName = value; // Temporary field to hold input
        })
      )
      .addButton((button) =>
        button
          .setButtonText("Add")
          .setCta()
          .onClick(() => {
            const folderInput = normalizePath(this.tempFolderName);
            if (
              folderInput &&
              !this.plugin.settings.excludedFolders.includes(folderInput)
            ) {
              this.plugin.settings.excludedFolders.push(folderInput);
              this.plugin.saveSettings();
              this.display();
            }
          })
      );

    containerEl.createEl("ul", { cls: "exclude-folders-list" });
    this.plugin.settings.excludedFolders.forEach((folder) => {
      const li = containerEl.createEl("li", { text: folder });
      const deleteButton = li.createEl("button", { text: "Remove" });
      deleteButton.addEventListener("click", () => {
        this.plugin.settings.excludedFolders =
          this.plugin.settings.excludedFolders.filter((f) => f !== folder);
        this.plugin.saveSettings();
        this.display(); // Refresh UI
      });
    });

    new Setting(containerEl)
      .setName("Reset settings")
      .setDesc("Reset all settings to default")
      .addButton((button) =>
        button.setButtonText("Reset").onClick(async () => {
          this.plugin.settings = DEFAULT_SETTINGS;
          await this.plugin.saveSettings();
          this.display();
        })
      );
  }
}
